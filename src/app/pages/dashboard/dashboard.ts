import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectCardComponent } from '../../components/project-card/project-card.component';
import { DashboardHeaderComponent } from '../../components/dashboard-header/dashboard-header.component';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { SessionService } from '../../services/session.service';
import { InvitationService } from '../../services/invitation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardHeaderComponent, ProjectCardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private projectService = inject(ProjectService);
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private cdr = inject(ChangeDetectorRef);
  private invitationService = inject(InvitationService);

  user$ = this.authService.user$;
  userData$ = this.authService.userData$;
  recentProjects: any[] = [];
  pendingInvites: any[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.recentProjects = projects as any[];
        this.error = '';
        this.loading = false;

        // Auto-reconnect if session exists and redirect is allowed
        if (this.sessionService.shouldAutoRedirect()) {
          const lastId = this.sessionService.getLastProject();
          if (lastId && this.recentProjects.some(p => p.id === lastId)) {
            this.goToProject(lastId);
          }
        }

        this.cdr.detectChanges();
      }
    });

    // Carregar convites se for professor
    this.user$.subscribe(user => {
      if (user?.email) {
        this.invitationService.getPendingInvites(user.email).subscribe(invites => {
          this.pendingInvites = invites;
          this.cdr.detectChanges();
        });
      }
    });
  }

  async respondToInvite(invite: any, status: 'accepted' | 'declined') {
    try {
      await this.invitationService.respondToInvite(invite.id, status, invite);
      // O Firestore onSnapshot atualizará a lista automaticamente
    } catch (err) {
      console.error('Erro ao responder convite:', err);
    }
  }

  goToProject(projectId: string) {
    this.sessionService.saveLastProject(projectId);
    this.router.navigate(['/projeto', projectId]);
  }

  get stats() {
    const completedTasks = this.recentProjects.reduce((acc, p) => acc + (p.completedTasksCount || 0), 0);
    const totalTasks = this.recentProjects.reduce((acc, p) => acc + (p.tasksCount || 0), 0);
    
    const obtainedMaterials = this.recentProjects.reduce((acc, p) => acc + (p.obtainedMaterialsCount || 0), 0);
    const totalMaterials = this.recentProjects.reduce((acc, p) => acc + (p.materialsCount || 0), 0);
    
    return [
      { label: 'Projetos Criados', value: this.recentProjects.length.toString(), icon: '🧪', color: '#6366f1' },
      { label: 'Tarefas Concluídas', value: `${completedTasks}/${totalTasks}`, icon: '✅', color: '#22c55e' },
      { label: 'Materiais Salvos', value: `${obtainedMaterials}/${totalMaterials}`, icon: '📚', color: '#f59e0b' },
    ];
  }

  goToGenerator() {
    this.router.navigate(['/gerar']);
  }

  onHome() {
    this.sessionService.disableAutoRedirect();
    this.cdr.detectChanges();
  }
}
