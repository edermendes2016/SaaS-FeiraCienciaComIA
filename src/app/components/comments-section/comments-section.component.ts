import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollaborationService, Comment } from '../../services/collaboration.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-comments-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="comments-section glass">
      <div class="section-header">
        <h3>💬 Feedback & Comentários</h3>
        <span class="count-badge" *ngIf="(comments$ | async)?.length as count">{{ count }}</span>
      </div>
      
      <div class="comments-list" #scrollMe [scrollTop]="scrollMe.scrollHeight">
        <div *ngFor="let comment of comments$ | async" 
             class="comment-item" 
             [class.own]="comment.userId === currentUserId"
             [class.teacher]="comment.userRole === 'teacher'">
          
          <div class="comment-meta">
            <span class="user-name">
              {{ comment.userName }}
              <span class="role-badge" *ngIf="comment.userRole === 'teacher'">Orientador</span>
            </span>
            <span class="time" *ngIf="comment.createdAt">{{ comment.createdAt.toDate() | date:'shortTime' }}</span>
          </div>
          <p class="text">{{ comment.text }}</p>
        </div>

        <div *ngIf="(comments$ | async)?.length === 0" class="empty-comments">
          <p>Nenhum feedback ainda. Orientadores podem deixar sugestões aqui!</p>
        </div>
      </div>

      <div class="comment-input-wrapper">
        <textarea [(ngModel)]="newCommentText" 
                  placeholder="Escreva um comentário ou sugestão..." 
                  (keydown.enter)="$event.preventDefault(); send()"
                  class="glass-input"></textarea>
        <button class="btn-send" (click)="send()" [disabled]="!newCommentText.trim()">
          <span>✈️</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .comments-section {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      height: 500px;
      border-radius: 20px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    h3 { margin: 0; font-size: 1.2rem; color: var(--text-main); }

    .count-badge {
      background: var(--color-primary);
      color: white;
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 700;
    }

    .comments-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding-right: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .comments-list::-webkit-scrollbar { width: 4px; }
    .comments-list::-webkit-scrollbar-track { background: transparent; }
    .comments-list::-webkit-scrollbar-thumb { 
      background: rgba(255, 255, 255, 0.1); 
      border-radius: 10px; 
    }

    .comment-item {
      max-width: 90%;
      padding: 1rem;
      border-radius: 16px;
      background: var(--glass-bg);
      border: 1px solid var(--card-border);
      transition: all 0.3s ease;
    }

    .comment-item.own {
      align-self: flex-end;
      background: rgba(234, 88, 12, 0.1);
      border-color: rgba(234, 88, 12, 0.2);
    }

    .comment-item.teacher {
      border-left: 4px solid #facc15;
      background: rgba(250, 204, 21, 0.05);
      max-width: 95%;
    }

    .comment-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .user-name { 
      font-weight: 700; 
      color: var(--color-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .role-badge {
      background: #facc15;
      color: #422006;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .time { opacity: 0.5; }

    .text { 
      margin: 0; 
      font-size: 0.95rem; 
      line-height: 1.5;
      color: var(--text-main);
      word-break: break-word;
    }

    .empty-comments {
      text-align: center;
      opacity: 0.5;
      padding: 2rem 0;
      font-style: italic;
    }

    .comment-input-wrapper {
      display: flex;
      gap: 0.75rem;
      align-items: flex-end;
    }

    textarea {
      flex: 1;
      height: 45px;
      min-height: 45px;
      max-height: 120px;
      border-radius: 12px;
      padding: 0.75rem;
      font-size: 0.9rem;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      color: var(--input-text);
      transition: all 0.3s ease;
    }

    .btn-send {
      width: 45px;
      height: 45px;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-send:hover:not(:disabled) {
      transform: scale(1.05);
      filter: brightness(1.1);
    }

    .btn-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class CommentsSectionComponent implements OnInit {
  @Input() projectId = '';
  
  private colabService = inject(CollaborationService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  comments$!: Observable<Comment[]>;
  project: any;
  newCommentText = '';
  currentUserId = '';

  ngOnInit() {
    this.comments$ = this.colabService.getComments(this.projectId);
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.cdr.detectChanges();
      }
    });
    
    this.colabService.getProject(this.projectId).subscribe(proj => {
      this.project = proj;
      this.cdr.detectChanges();
    });
  }

  async send() {
    const text = this.newCommentText.trim();
    if (!text) return;
    
    // Limpa o campo IMEDIATAMENTE e força atualização da UI
    this.newCommentText = '';
    this.cdr.detectChanges();

    try {
      const user = await this.authService.getCurrentUser();
      if (!user) return;

      const userRole = this.project?.members?.[user.uid]?.role || 'student';

      await this.colabService.addComment(this.projectId, {
        projectId: this.projectId,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Membro',
        userRole: userRole,
        text: text
      });
      
      // Força o scroll para baixo e atualização após o envio
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erro ao enviar:', error);
      // Opcional: devolver o texto se quiser, mas o usuário pediu para limpar logo
    }
  }
}
