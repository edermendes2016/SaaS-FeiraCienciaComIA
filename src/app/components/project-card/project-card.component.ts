import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, SlicePipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, SlicePipe, DatePipe],
  template: `
    <div class="project-card glass" (click)="onOpen()">
      <div class="card-header">
        <span class="subject-badge">{{ subject }}</span>
        <span class="difficulty-badge" [class]="difficultyClass">{{ difficulty }}</span>
      </div>
      <h3 class="title">{{ title }}</h3>
      <p class="description">{{ description | slice:0:80 }}{{ description.length > 80 ? '...' : '' }}</p>
      
      <div class="project-stats">
        <div class="stat-row">
          <span>✅ Tarefas: {{ completedTasksCount }}/{{ tasksCount }}</span>
          <div class="progress-bar">
            <div class="progress-fill tasks" [style.width.%]="taskProgress"></div>
          </div>
        </div>
        <div class="stat-row">
          <span>📚 Materiais: {{ obtainedMaterialsCount }}/{{ materialsCount }}</span>
          <div class="progress-bar">
            <div class="progress-fill materials" [style.width.%]="materialProgress"></div>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <span class="date">📅 {{ date | date:'shortDate' }}</span>
        <button class="btn-open">Abrir Projeto ➔</button>
      </div>
    </div>
  `,
  styles: [`
    .project-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .project-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 12px 40px 0 rgba(234, 88, 12, 0.2);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .subject-badge {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-primary);
      background: rgba(234, 88, 12, 0.1);
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
    }

    .difficulty-badge {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      background: var(--glass-bg);
    }

    .difficulty-badge.facil { color: var(--status-success); }
    .difficulty-badge.medio { color: var(--status-warning); }
    .difficulty-badge.avancado { color: var(--status-danger); }

    .title {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
      line-height: 1.2;
    }

    .description {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.4;
    }

    .project-stats {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      margin: 0.5rem 0;
    }

    .stat-row {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .progress-bar {
      height: 4px;
      background: var(--card-border);
      border-radius: 10px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 10px;
      transition: width 0.5s ease-out;
    }

    .progress-fill.tasks { background: var(--color-primary); }
    .progress-fill.materials { background: #f59e0b; }

    .card-footer {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.8rem;
      border-top: 1px solid var(--card-border);
    }

    .date {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .btn-open {
      background: transparent;
      border: none;
      color: var(--color-primary);
      font-weight: 700;
      cursor: pointer;
      transition: gap 0.2s;
    }

    .project-card:hover .btn-open {
      text-decoration: underline;
    }
  `]
})
export class ProjectCardComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() subject = '';
  @Input() difficulty = '';
  @Input() tasksCount = 0;
  @Input() completedTasksCount = 0;
  @Input() materialsCount = 0;
  @Input() obtainedMaterialsCount = 0;

  get taskProgress() {
    if (!this.tasksCount) return 0;
    return (this.completedTasksCount / this.tasksCount) * 100;
  }

  get materialProgress() {
    if (!this.materialsCount) return 0;
    return (this.obtainedMaterialsCount / this.materialsCount) * 100;
  }

  get difficultyClass() {
    return this.difficulty.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  @Input() set date(value: any) {
    if (value?.toDate) {
      this._date = value.toDate();
    } else if (value instanceof Date) {
      this._date = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      this._date = new Date(value);
    }
  }
  get date() { return this._date; }
  private _date = new Date();

  @Output() open = new EventEmitter<void>();

  onOpen() {
    this.open.emit();
  }
}
