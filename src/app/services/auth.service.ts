import { Injectable, inject } from '@angular/core';
import { Auth, user, GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailLink, isSignInWithEmailLink, signInWithEmailLink as firebaseSignInLink, sendSignInLinkToEmail, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, serverTimestamp, collection, addDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import DOMPurify from 'dompurify';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  user$ = user(this.auth);

  async getCurrentUser() {
    return this.auth.currentUser;
  }
  
  userData$ = this.user$.pipe(
    switchMap(firebaseUser => {
      if (!firebaseUser) return of(null);
      const userRef = doc(this.firestore, `users/${firebaseUser.uid}`);
      return from(getDoc(userRef)).pipe(
        map(snap => snap.exists() ? snap.data() : null)
      );
    })
  );

  private failedAttempts = 0;
  private cooldownUntil = 0;

  constructor() {
    this.handleEmailLinkSignIn();
  }

  async register(email: string, pass: string, name: string, userData: any) {
    if (this.isRateLimited()) throw new Error('Muitas tentativas. Tente novamente em 30 segundos.');
    
    try {
      const sanitizedName = DOMPurify.sanitize(name.trim());
      const result = await createUserWithEmailAndPassword(this.auth, email.trim().toLowerCase(), pass.trim());
      
      if (userData.role === 'teacher') {
        await addDoc(collection(this.firestore, 'teacher_requests'), {
          uid: result.user.uid,
          name: sanitizedName,
          email: email.trim().toLowerCase(),
          schoolName: userData.schoolName,
          status: 'pending',
          createdAt: serverTimestamp()
        });
      }

      await this.updateUserData(result.user, { 
        displayName: sanitizedName, 
        ...userData
      });
      
      this.resetRateLimit();
      return result.user;
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  async login(email: string, pass: string) {
    if (this.isRateLimited()) throw new Error('Muitas tentativas. Tente novamente em 30 segundos.');

    try {
      const result = await signInWithEmailAndPassword(this.auth, email.trim().toLowerCase(), pass.trim());
      this.resetRateLimit();
      return result.user;
    } catch (error) {
      this.trackFailedAttempt();
      this.handleAuthError(error);
    }
  }

  private isRateLimited(): boolean {
    const now = Date.now();
    const storedCooldown = Number(localStorage.getItem('auth_cooldown') || '0');
    return now < this.cooldownUntil || now < storedCooldown;
  }

  private trackFailedAttempt() {
    this.failedAttempts++;
    if (this.failedAttempts >= 5) {
      const cooldownTime = Date.now() + 30000;
      this.cooldownUntil = cooldownTime;
      localStorage.setItem('auth_cooldown', cooldownTime.toString());
      this.failedAttempts = 0;
    }
  }

  private resetRateLimit() {
    this.failedAttempts = 0;
    this.cooldownUntil = 0;
    localStorage.removeItem('auth_cooldown');
  }

  private handleAuthError(error: any): never {
    let message = 'Ocorreu um erro na autenticação.';
    switch (error.code) {
      case 'auth/invalid-credential': message = 'E-mail ou senha incorretos.'; break;
      case 'auth/email-already-in-use': message = 'Este e-mail já está em uso.'; break;
      case 'auth/weak-password': message = 'A senha é muito fraca.'; break;
      case 'auth/network-request-failed': message = 'Erro de rede. Verifique sua conexão.'; break;
    }
    throw new Error(message);
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      await this.updateUserData(result.user);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Google login error:', error);
    }
  }

  async sendMagicLink(email: string) {
    const actionCodeSettings = {
      url: window.location.origin + '/login',
      handleCodeInApp: true
    };
    try {
      await sendSignInLinkToEmail(this.auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      return true;
    } catch (error) {
      console.error('Magic link error:', error);
      return false;
    }
  }

  private async handleEmailLinkSignIn() {
    if (isSignInWithEmailLink(this.auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Por favor, confirme seu e-mail para entrar:');
      }
      if (email) {
        try {
          const result = await firebaseSignInLink(this.auth, email, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          await this.updateUserData(result.user);
          this.router.navigate(['/dashboard']);
        } catch (error) {
          console.error('Email link sign-in error:', error);
        }
      }
    }
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  private async updateUserData(user: any, additionalData: any = {}) {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    
    const data = {
      uid: user.uid,
      email: user.email,
      displayName: additionalData.displayName || user.displayName || 'Estudante',
      schoolName: additionalData.schoolName || '',
      role: additionalData.role || 'student',
      approved: additionalData.approved ?? true,
      grade: additionalData.grade || '',
      class: additionalData.class || '',
      photoURL: user.photoURL || '',
      lastLogin: serverTimestamp(),
      theme: 'dark'
    };

    try {
      return await setDoc(userRef, data, { merge: true });
    } catch (error) {
      console.error('Erro ao salvar dados do usuário no Firestore:', error);
    }
  }
}
