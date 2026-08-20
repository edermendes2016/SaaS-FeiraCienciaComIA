import { Injectable, inject, NgZone } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface ProjectTask {
  id?: string;
  title: string;
  assignedTo: string;
  completed: boolean;
  createdAt: any;
  phase?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private firestore = inject(Firestore);
  private zone = inject(NgZone);

  getTasks(projectId: string): Observable<ProjectTask[]> {
    const tasksRef = collection(this.firestore, `projects/${projectId}/tasks`);
    const q = query(tasksRef, orderBy('createdAt', 'asc'));
    
    return new Observable<ProjectTask[]>(subscriber => {
      const unsubscribe = onSnapshot(q, 
        (snap) => {
          const tasks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectTask));
          this.zone.run(() => subscriber.next(tasks));
        },
        (error) => this.zone.run(() => subscriber.error(error))
      );
      return () => unsubscribe();
    });
  }

  async addTask(projectId: string, task: Partial<ProjectTask>) {
    const tasksRef = collection(this.firestore, `projects/${projectId}/tasks`);
    return addDoc(tasksRef, {
      ...task,
      completed: task.completed ?? false,
      createdAt: serverTimestamp()
    });
  }

  async updateTask(projectId: string, taskId: string, data: Partial<ProjectTask>) {
    const taskRef = doc(this.firestore, `projects/${projectId}/tasks/${taskId}`);
    return updateDoc(taskRef, data);
  }

  async deleteTask(projectId: string, taskId: string) {
    const taskRef = doc(this.firestore, `projects/${projectId}/tasks/${taskId}`);
    return deleteDoc(taskRef);
  }
}
