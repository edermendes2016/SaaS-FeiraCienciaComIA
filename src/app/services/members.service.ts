import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, setDoc, deleteDoc, collectionData, query, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface ProjectMember {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private firestore = inject(Firestore);

  getMembers(projectId: string): Observable<ProjectMember[]> {
    const membersRef = collection(this.firestore, `projects/${projectId}/members`);
    return collectionData(membersRef) as Observable<ProjectMember[]>;
  }

  async addMember(projectId: string, userId: string, role: 'editor' | 'viewer' = 'viewer') {
    const memberRef = doc(this.firestore, `projects/${projectId}/members/${userId}`);
    return setDoc(memberRef, {
      userId,
      role,
      joinedAt: serverTimestamp()
    });
  }

  async removeMember(projectId: string, userId: string) {
    const memberRef = doc(this.firestore, `projects/${projectId}/members/${userId}`);
    return deleteDoc(memberRef);
  }
}
