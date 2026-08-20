import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-waiting-approval',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="login-wrapper">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="login-card glass animate-fade-in-up">
        <div class="brand">
          <div class="brand-icon">⏳</div>
          <h1 class="gradient-text">Aguardando Aprovação</h1>
          <p class="brand-subtitle">Seu cadastro de professor foi recebido.</p>
        </div>
        
        <div class="info-card">
          <p>Para garantir a segurança da plataforma, novos cadastros de professores são revisados manualmente.</p>
          <p>Você receberá um e-mail assim que seu acesso for liberado.</p>
        </div>

        <a routerLink="/login" class="btn btn-primary btn-full">Voltar ao Login</a>
      </div>
    </div>
  `,
  styles: [`
    .info-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1.5rem;
      margin: 2rem 0;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .info-card p {
      color: var(--text-secondary);
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 1rem;
    }
    .info-card p:last-child { margin-bottom: 0; }
  `]
})
export class WaitingApproval {}
