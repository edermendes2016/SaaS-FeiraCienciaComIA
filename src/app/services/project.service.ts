import { Injectable, inject, NgZone } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, setDoc, onSnapshot } from '@angular/fire/firestore';
import { Observable, of, combineLatest } from 'rxjs';
import { switchMap, map, debounceTime, filter } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Project {
  id?: string;
  title: string;
  description: string;
  ownerId: string;
  progress: number;
  createdAt: any;
  difficulty: string;
  subject: string;
  teamSize: number;
  deadline?: string;
  emoji?: string;
  color?: string;
  executionProtocol?: any;
  reportDraft?: any;
  currentStep?: number;
  explanation?: any;
  tasksCount?: number;
  completedTasksCount?: number;
  materialsCount?: number;
  obtainedMaterialsCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private zone = inject(NgZone);

  getProjects(): Observable<Project[]> {
    return this.auth.user$.pipe(
      filter(user => !!user),
      switchMap(user => {
        if (!user) return of([]);
        
        const projectsRef = collection(this.firestore, 'projects');
        
        // Projetos que eu criei
        const qOwner = query(projectsRef, where('ownerId', '==', user.uid));
        
        // Projetos onde sou membro (orientador)
        const qMember = query(projectsRef, where(`members.${user.uid}.status`, '==', 'accepted'));
        
        const owner$ = new Observable<Project[]>(subscriber => {
          return onSnapshot(qOwner, (snap) => {
            subscriber.next(snap.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
          }, err => subscriber.error(err));
        });

        const member$ = new Observable<Project[]>(subscriber => {
          return onSnapshot(qMember, (snap) => {
            subscriber.next(snap.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
          }, err => subscriber.error(err));
        });

        return combineLatest([owner$, member$]).pipe(
          map(([owned, member]) => {
            const all = [...owned, ...member];
            // Remover duplicatas por ID
            const unique = Array.from(new Map(all.map(p => [p.id, p])).values());
            
            return unique.sort((a, b) => {
              const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
              const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
              return timeB - timeA;
            });
          }),
          // Garantir que a emissão aconteça dentro da zona do Angular
          map(projects => {
            this.zone.run(() => {}); // Só para garantir o tick se necessário
            return projects;
          })
        );
      })
    );
  }

  getProjectWithDetails(projectId: string): Observable<any> {
    const projectRef = doc(this.firestore, `projects/${projectId}`);
    
    return new Observable(subscriber => {
      const unsubscribe = onSnapshot(projectRef, 
        (snap) => {
          if (!snap.exists()) {
            this.zone.run(() => subscriber.next(null));
            return;
          }
          this.zone.run(() => subscriber.next({ id: snap.id, ...snap.data() }));
        },
        (error) => this.zone.run(() => subscriber.error(error))
      );
      return () => unsubscribe();
    }).pipe(
      switchMap(project => {
        if (!project) return of(null);

        const subcollections = ['tasks', 'materials', 'steps', 'members'];
        const subObservables: any = { project: of(project) };

        subcollections.forEach(sub => {
          const subRef = collection(this.firestore, `projects/${projectId}/${sub}`);
          subObservables[sub] = new Observable(subSubscriber => {
            const unsubSub = onSnapshot(subRef, 
              (subSnap) => {
                const data = subSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                this.zone.run(() => subSubscriber.next(data));
              },
              (err) => this.zone.run(() => subSubscriber.error(err))
            );
            return () => unsubSub();
          });
        });

        return combineLatest(subObservables).pipe(
          map((data: any) => ({
            ...data.project,
            tasks: data.tasks,
            materials: data.materials,
            steps: data.steps,
            members: data.members
          }))
        );
      })
    );
  }

  async createProject(projectData: Partial<Project>) {
    const user = this.auth.auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    const projectsRef = collection(this.firestore, 'projects');
    const newProject = {
      ...projectData,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      progress: projectData.progress || 0,
      members: {
        [user.uid]: {
          role: 'student',
          status: 'accepted',
          name: user.displayName || 'Aluno'
        }
      }
    };

    const docRef = await addDoc(projectsRef, newProject);
    return docRef.id;
  }

  async updateProject(projectId: string, data: Partial<Project>) {
    const projectRef = doc(this.firestore, `projects/${projectId}`);
    return await updateDoc(projectRef, data);
  }

  async deleteProject(projectId: string) {
    const projectRef = doc(this.firestore, `projects/${projectId}`);
    return await deleteDoc(projectRef);
  }
}
