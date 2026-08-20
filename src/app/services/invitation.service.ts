import { Injectable, inject, NgZone } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, query, where, onSnapshot, serverTimestamp, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Invite {
  id?: string;
  projectId: string;
  projectTitle: string;
  senderId: string;
  senderName: string;
  receiverEmail: string;
  role: 'student' | 'teacher';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private zone = inject(NgZone);

  async sendInvite(projectId: string, projectTitle: string, receiverEmail: string, role: 'student' | 'teacher' = 'teacher') {
    const user = await this.auth.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    const invitesRef = collection(this.firestore, 'invites');
    return addDoc(invitesRef, {
      projectId,
      projectTitle,
      senderId: user.uid,
      senderName: user.email?.split('@')[0] || 'Colega',
      receiverEmail: receiverEmail.trim().toLowerCase(),
      role,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  }

  getPendingInvites(email: string): Observable<Invite[]> {
    const invitesRef = collection(this.firestore, 'invites');
    const q = query(
      invitesRef, 
      where('receiverEmail', '==', email.toLowerCase()),
      where('status', '==', 'pending')
    );

    return new Observable<Invite[]>(subscriber => {
      const unsubscribe = onSnapshot(q, (snap) => {
        const invites = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invite));
        this.zone.run(() => subscriber.next(invites));
      }, err => this.zone.run(() => subscriber.error(err)));
      return () => unsubscribe();
    });
  }

  async respondToInvite(inviteId: string, status: 'accepted' | 'declined', invite: Invite) {
    const user = await this.auth.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    const inviteRef = doc(this.firestore, `invites/${inviteId}`);
    await updateDoc(inviteRef, { status });

    if (status === 'accepted') {
      const projectRef = doc(this.firestore, `projects/${invite.projectId}`);
      await updateDoc(projectRef, {
        [`members.${user.uid}`]: {
          role: invite.role,
          status: 'accepted',
          name: user.email?.split('@')[0] || 'Membro'
        }
      });
    }
  }
}
