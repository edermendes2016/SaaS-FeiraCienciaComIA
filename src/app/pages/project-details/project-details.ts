import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CollaborationService } from '../../services/collaboration.service';
import { SessionService } from '../../services/session.service';
import { GeminiService } from '../../services/gemini.service';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { InvitationService } from '../../services/invitation.service';
import { ChatService } from '../../services/chat.service';
import { FormsModule } from '@angular/forms';
import { DashboardHeaderComponent } from '../../components/dashboard-header/dashboard-header.component';
import { ProgressStepperComponent, Step } from '../../components/progress-stepper/progress-stepper.component';
import { CommentsSectionComponent } from '../../components/comments-section/comments-section.component';
import { Observable, firstValueFrom } from 'rxjs';
import { TaskService, ProjectTask } from '../../services/task.service';
import { MaterialsService, Material } from '../../services/materials.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, DashboardHeaderComponent, ProgressStepperComponent, CommentsSectionComponent, FormsModule],
  templateUrl: './project-details.html',
  styleUrl: './project-details.css'
})
export class ProjectDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private colabService = inject(CollaborationService);
  private sessionService = inject(SessionService);
  private gemini = inject(GeminiService);
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private invitationService = inject(InvitationService);
  private chatService = inject(ChatService);
  private taskService = inject(TaskService);
  private materialsService = inject(MaterialsService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  projectId = '';
  project$: Observable<any> | undefined;
  tasks$: Observable<ProjectTask[]> | undefined;
  materials$: Observable<Material[]> | undefined;
  isGenerating = false;
  showInviteModal = false;
  showDeleteModal = false;
  messageIdToDelete = '';

  // Exclusão de Projeto
  showDeleteProjectModal = false;
  inviteEmail = '';
  inviteRole: 'student' | 'teacher' = 'student';
  currentUser: any = null;
  currentProject: any = null;
  
  // Chat
  messages$: Observable<any[]> | undefined;
  newMessage = '';
  
  steps: Step[] = [
    { label: 'Definição', icon: '📝', active: true, completed: true },
    { label: 'Pesquisa', icon: '🔍', active: true, completed: false },
    { label: 'Execução', icon: '🧪', active: false, completed: false },
    { label: 'Relatório', icon: '📊', active: false, completed: false },
  ];

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    if (this.projectId) {
      this.project$ = this.colabService.getProject(this.projectId);
      this.tasks$ = this.taskService.getTasks(this.projectId);
      this.materials$ = this.materialsService.getMaterials(this.projectId);
      this.messages$ = this.chatService.getMessages(this.projectId);
      this.sessionService.saveLastProject(this.projectId);

      this.authService.user$.subscribe(user => {
        this.currentUser = user;
      });

      // Sincronizar steps e contadores
      this.project$.subscribe(project => {
        this.currentProject = project;
        if (project && project.currentStep !== undefined) {
          this.updateSteps(project.currentStep);
        }
      });

      // Garantir contadores para projetos antigos
      this.tasks$?.subscribe(tasks => {
        if (this.currentProject && this.currentProject.tasksCount === undefined) {
          this.projectService.updateProject(this.projectId, {
            tasksCount: tasks.length,
            completedTasksCount: tasks.filter(t => t.completed).length
          });
        }
      });

      this.materials$?.subscribe(mats => {
        if (this.currentProject && this.currentProject.materialsCount === undefined) {
          this.projectService.updateProject(this.projectId, {
            materialsCount: mats.length,
            obtainedMaterialsCount: mats.filter(m => m.obtained).length
          });
        }
      });
    }
  }

  isOwner(project: any): boolean {
    return this.currentUser?.uid === project.ownerId;
  }

  isMember(project: any): boolean {
    if (!this.currentUser) return false;
    if (this.isOwner(project)) return true;
    return project.members && project.members[this.currentUser.uid]?.status === 'accepted';
  }

  get studentCount(): number {
    if (!this.currentProject?.members) return 0;
    return Object.values(this.currentProject.members).filter((m: any) => m.role === 'student').length;
  }

  isInviting = false;

  async sendInvite(project: any) {
    if (!this.inviteEmail || this.isInviting) return;

    // Verificar limite de equipe se for convite para aluno
    if (this.inviteRole === 'student' && this.studentCount >= (project.teamSize || 1)) {
      this.toast.warning(`Equipe cheia! O limite deste projeto é de ${project.teamSize} alunos.`);
      return;
    }

    this.isInviting = true;
    try {
      await this.invitationService.sendInvite(this.projectId, project.title, this.inviteEmail, this.inviteRole);
      
      this.ngZone.run(() => {
        this.showInviteModal = false;
        this.inviteEmail = '';
        this.toast.success('Convite enviado com sucesso! 🚀');
      });

    } catch (err) {
      console.error('Erro ao enviar convite:', err);
      this.ngZone.run(() => {
        this.toast.error('Ocorreu um erro ao enviar o convite. Tente novamente.');
      });
    } finally {
      this.ngZone.run(() => {
        this.isInviting = false;
        this.cdr.detectChanges();
      });
    }
  }

  async sendMessage() {
    if (!this.newMessage.trim()) return;
    try {
      await this.chatService.sendMessage(this.projectId, this.newMessage);
      this.newMessage = '';
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  }

  async deleteMessage(messageId: string) {
    if (confirm('Tem certeza que deseja apagar esta mensagem?')) {
      await this.chatService.deleteMessage(this.projectId, messageId);
    }
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.messageIdToDelete = '';
  }

  // Lógica de exclusão de projeto
  openDeleteProjectModal() {
    this.showDeleteProjectModal = true;
  }

  cancelDeleteProject() {
    this.showDeleteProjectModal = false;
  }

  async confirmDeleteProject() {
    try {
      await this.projectService.deleteProject(this.projectId);
      this.toast.success('Projeto excluído para sempre! 💥');
      this.sessionService.clearSession();
      this.router.navigate(['/dashboard']);
    } catch (err) {
      console.error('Erro ao excluir projeto:', err);
      this.toast.error('Você não tem permissão ou ocorreu um erro.');
    } finally {
      this.showDeleteProjectModal = false;
    }
  }

  private updateSteps(currentStep: number) {
    this.steps = this.steps.map((step, index) => ({
      ...step,
      active: index === currentStep,
      completed: index < currentStep
    }));
  }

  async generatePhaseDetails(phase: 'execution' | 'report', project: any) {
    if (this.isGenerating) return;
    this.isGenerating = true;
    
    try {
      if (phase === 'execution') {
        const protocol = await firstValueFrom(this.gemini.generateExecutionProtocol(project.title, project.description));
        await this.projectService.updateProject(this.projectId, { 
          executionProtocol: protocol,
          currentStep: 2 // Move to Execution phase
        });
        this.toast.success('Guia de execução gerado com sucesso! 🧪');
      } else {
        const report = await firstValueFrom(this.gemini.generateProjectReport(project.title, project.description));
        await this.projectService.updateProject(this.projectId, { 
          reportDraft: report,
          currentStep: 3 // Move to Report phase
        });
        this.toast.success('Rascunho do relatório gerado! 📊');
      }
    } catch (err) {
      console.error('Erro na expansão IA:', err);
      this.toast.error('Ocorreu um erro ao gerar o conteúdo com IA. Tente novamente.');
    } finally {
      this.isGenerating = false;
      this.cdr.detectChanges();
    }
  }

  async generateConcept(project: any) {
    if (this.isGenerating) return;
    this.isGenerating = true;
    try {
      const fullData = await firstValueFrom(this.gemini.generateProject(project.title, project.subject, project.difficulty));
      await this.projectService.updateProject(this.projectId, { 
        explanation: fullData.explanation 
      });
      this.toast.success('Conceito científico gerado com sucesso! 📘');
    } catch (err) {
      console.error('Erro ao gerar conceito:', err);
      this.toast.error('Erro ao gerar explicação científica.');
    } finally {
      this.isGenerating = false;
      this.cdr.detectChanges();
    }
  }

  backToDashboard() {
    this.sessionService.disableAutoRedirect();
    this.router.navigate(['/dashboard']);
  }

  onNewProject() {
    this.router.navigate(['/gerar']);
  }

  async toggleTask(task: ProjectTask) {
    if (!task.id) return;
    try {
      const newStatus = !task.completed;
      await this.taskService.updateTask(this.projectId, task.id, { completed: newStatus });
      
      // Atualizar contador no projeto
      const currentCount = this.currentProject?.completedTasksCount || 0;
      await this.projectService.updateProject(this.projectId, {
        completedTasksCount: newStatus ? currentCount + 1 : Math.max(0, currentCount - 1)
      });

      if (newStatus) {
        this.toast.success('Tarefa concluída! Parabéns! 🎉');
      }
    } catch (err) {
      this.toast.error('Erro ao atualizar tarefa.');
    }
  }

  async toggleMaterial(material: Material) {
    if (!material.id) return;
    try {
      const newStatus = !material.obtained;
      await this.materialsService.updateMaterial(this.projectId, material.id, { obtained: newStatus });

      // Atualizar contador no projeto
      const currentCount = this.currentProject?.obtainedMaterialsCount || 0;
      await this.projectService.updateProject(this.projectId, {
        obtainedMaterialsCount: newStatus ? currentCount + 1 : Math.max(0, currentCount - 1)
      });

      if (newStatus) {
        this.toast.success('Material obtido e salvo! 📚');
      }
    } catch (err) {
      this.toast.error('Erro ao atualizar material.');
    }
  }
}
