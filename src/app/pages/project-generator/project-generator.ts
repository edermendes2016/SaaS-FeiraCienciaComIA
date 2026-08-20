import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { IntentClassifierService } from '../../services/intent-classifier.service';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { MaterialsService } from '../../services/materials.service';
import { GeminiService, GeneratedProject } from '../../services/gemini.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';

type Tab = 'checklist' | 'tasks' | 'material';

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  phase: string;
}


export interface Task {
  role: string;
  icon: string;
  color: string;
  items: string[];
  hours: string;
}

@Component({
  selector: 'app-project-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './project-generator.html',
  styleUrl: './project-generator.css'
})
export class ProjectGenerator {
  // Form state
  topic = '';
  subject = '';
  teamSize = 3;
  difficulty = 'médio';
  deadline = '';

  subjects = [
    { name: 'Química', color: '#ea580c' },
    { name: 'Física', color: '#2563eb' },
    { name: 'Biologia', color: '#16a34a' },
    { name: 'Ecologia', color: '#059669' },
    { name: 'Astronomia', color: '#7c3aed' },
    { name: 'Matemática', color: '#db2777' },
    { name: 'Ciências da Terra', color: '#92400e' }
  ];
  difficulties = ['fácil', 'médio', 'avançado'];

  // Generation state
  isGenerating = signal(false);
  generated = signal(false);
  activeTab = signal<Tab>('checklist');

  // Guard state — search-guard-agent
  isBlocked = signal(false);
  blockedReason = signal('');
  blockedSuggestion = signal('');
  generationStep = signal(0);
  generationSteps = [
    '🔍 Validando escopo científico...',
    '🤖 Gerando estrutura do projeto...',
    '✅ Criando checklist...',
    '👥 Dividindo tarefas...',
    '📚 Compilando material de estudo...',
    '✨ Finalizando projeto...',
  ];

  // Generated data
  projectTitle = '';
  projectDescription = '';

  checklistItems: ChecklistItem[] = [];
  tasks: Task[] = [];
  materials: { name: string; quantity: string }[] = [];
  studyMaterial: any = null;

  setTab(tab: Tab) { this.activeTab.set(tab); }

  dismissBlock() {
    this.isBlocked.set(false);
    this.blockedReason.set('');
    this.blockedSuggestion.set('');
  }

  constructor(
    private classifier: IntentClassifierService,
    private gemini: GeminiService,
    private projectService: ProjectService,
    private taskService: TaskService,
    private materialsService: MaterialsService,
    private toast: ToastService,
    private router: Router,
    private sessionService: SessionService
  ) { }

  generate() {
    if (!this.topic || !this.subject) return;

    // ── search-guard-agent: classify intent before anything else ──
    const classification = this.classifier.classify(this.topic);
    if (!classification.allowed) {
      this.isBlocked.set(true);
      this.blockedReason.set(classification.reason);
      this.blockedSuggestion.set(classification.suggestion);
      this.generated.set(false);
      return; // STOP — topic is out of scope
    }

    // ── Proceed with generation ──────────────────────────────────
    this.isBlocked.set(false);
    this.isGenerating.set(true);
    this.generated.set(false);
    this.generationStep.set(1); // Start at step 1

    this.gemini.generateProject(this.topic, this.subject, this.difficulty).subscribe({
      next: (project) => {
        this.generationStep.set(6); // Finalizing
        this.mapProjectData(project);
        this.toast.success('Estrutura gerada com sucesso pela IA! ✨');
        this.saveToFirebase();
      },
      error: (err) => {
        console.error('Erro na geração IA:', err);
        this.isGenerating.set(false);
        this.toast.error('Ocorreu um erro ao gerar o projeto com IA.');
      }
    });
  }

  private mapProjectData(data: GeneratedProject) {
    this.projectTitle = data.title;
    this.projectDescription = data.description;
    this.checklistItems = data.checklist.map((item, idx) => ({
      id: String(idx + 1),
      label: item.label,
      done: false,
      phase: item.phase
    }));
    this.tasks = data.tasks;
    this.materials = data.materials;
    this.studyMaterial = data.explanation;
  }

  async saveToFirebase() {
    try {
      const projectId = await this.projectService.createProject({
        title: this.projectTitle,
        description: this.projectDescription,
        subject: this.subject,
        difficulty: this.difficulty,
        teamSize: this.teamSize,
        deadline: this.deadline,
        emoji: '🧪',
        color: '#6366f1',
        explanation: this.studyMaterial,
        tasksCount: this.checklistItems.length,
        completedTasksCount: 0,
        materialsCount: this.materials.length,
        obtainedMaterialsCount: 0
      });

      // Save Tasks
      for (const item of this.checklistItems) {
        await this.taskService.addTask(projectId, {
          title: item.label,
          phase: item.phase,
          completed: item.done,
          assignedTo: '' // Unassigned by default
        });
      }

      // Save Materials
      for (const mat of this.materials) {
        await this.materialsService.addMaterial(projectId, {
          name: mat.name,
          quantity: mat.quantity,
          obtained: false
        });
      }

      this.isGenerating.set(false);
      this.generated.set(true);

      this.toast.success('Projeto e materiais salvos com sucesso! 🚀');

      // Sucesso! Retorna para o Dashboard de forma limpa (sem redirecionar para projeto antigo)
      this.sessionService.disableAutoRedirect();
      this.router.navigate(['/dashboard']);

    } catch (err: any) {
      this.isGenerating.set(false);
      console.error('Erro ao salvar projeto no Firebase:', err);
      this.toast.error('Falha ao salvar o projeto no Firebase.');
    }
  }


  toggleChecklistItem(id: string) {
    this.checklistItems = this.checklistItems.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    );
  }

  get checklistProgress(): number {
    if (!this.checklistItems.length) return 0;
    return Math.round((this.checklistItems.filter(i => i.done).length / this.checklistItems.length) * 100);
  }

  get checklistPhases(): string[] {
    return [...new Set(this.checklistItems.map(i => i.phase))];
  }

  itemsByPhase(phase: string): ChecklistItem[] {
    return this.checklistItems.filter(i => i.phase === phase);
  }

}
