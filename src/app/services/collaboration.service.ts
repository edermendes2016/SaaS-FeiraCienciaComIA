import { Injectable, inject, NgZone } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, query, orderBy, Timestamp, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Comment {
  id?: string;
  projectId: string;
  userId: string;
  userName: string;
  userRole?: 'student' | 'teacher';
  text: string;
  createdAt: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class CollaborationService {
  private firestore = inject(Firestore);
  private zone = inject(NgZone);

  getProject(projectId: string): Observable<any> {
    const projectRef = doc(this.firestore, `projects/${projectId}`);
    return new Observable(subscriber => {
      const unsubscribe = onSnapshot(projectRef, 
        (snap) => {
          this.zone.run(() => {
            if (snap.exists()) {
              subscriber.next({ id: snap.id, ...snap.data() });
            } else {
              subscriber.next(null);
            }
          });
        },
        (error) => {
          this.zone.run(() => subscriber.error(error));
        }
      );
      return () => unsubscribe();
    });
  }

  getComments(projectId: string): Observable<Comment[]> {
    const commentsRef = collection(this.firestore, `projects/${projectId}/comments`);
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    
    return new Observable<Comment[]>(subscriber => {
      const unsubscribe = onSnapshot(q, 
        (snap) => {
          const comments = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Comment));
          this.zone.run(() => subscriber.next(comments));
        },
        (error) => {
          this.zone.run(() => subscriber.error(error));
        }
      );
      return () => unsubscribe();
    });
  }

  async addComment(projectId: string, comment: Partial<Comment>) {
    const commentsRef = collection(this.firestore, `projects/${projectId}/comments`);
    return addDoc(commentsRef, {
      ...comment,
      createdAt: Timestamp.now()
    });
  }

  async joinProject(projectId: string, userId: string) {
    const projectRef = doc(this.firestore, `projects/${projectId}`);
    return updateDoc(projectRef, {
      [`collaborators.${userId}`]: true,
      updatedAt: Timestamp.now()
    });
  }
}
