import { Injectable, inject, NgZone } from '@angular/core';
import { Firestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, deleteDoc, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private zone = inject(NgZone);

  getMessages(projectId: string): Observable<ChatMessage[]> {
    const messagesRef = collection(this.firestore, `projects/${projectId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    return new Observable<ChatMessage[]>(subscriber => {
      const unsubscribe = onSnapshot(q, (snap) => {
        const messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
        this.zone.run(() => subscriber.next(messages));
      }, err => this.zone.run(() => subscriber.error(err)));
      return () => unsubscribe();
    });
  }

  async sendMessage(projectId: string, text: string) {
    const user = await this.auth.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    const messagesRef = collection(this.firestore, `projects/${projectId}/messages`);
    return addDoc(messagesRef, {
      senderId: user.uid,
      senderName: user.email?.split('@')[0] || 'Membro',
      text: text.trim(),
      createdAt: serverTimestamp()
    });
  }

  async deleteMessage(projectId: string, messageId: string) {
    const messageRef = doc(this.firestore, `projects/${projectId}/messages/${messageId}`);
    return deleteDoc(messageRef);
  }
}
