import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly KEY = 'science_fair_last_project';

  private shouldRedirect = true;

  saveLastProject(projectId: string) {
    localStorage.setItem(this.KEY, projectId);
    // Quando salvamos um projeto novo/aberto, reabilitamos o redirecionamento para a próxima sessão
    this.shouldRedirect = true;
  }

  getLastProject(): string | null {
    if (!this.shouldRedirect) return null;
    return localStorage.getItem(this.KEY);
  }

  disableAutoRedirect() {
    this.shouldRedirect = false;
  }

  shouldAutoRedirect(): boolean {
    return this.shouldRedirect;
  }

  clearSession() {
    localStorage.removeItem(this.KEY);
    this.shouldRedirect = false;
  }
}
