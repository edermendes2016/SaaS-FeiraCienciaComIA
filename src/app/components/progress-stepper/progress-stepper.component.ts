import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Step {
  label: string;
  active: boolean;
  completed: boolean;
  icon: string;
}

@Component({
  selector: 'app-progress-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stepper glass">
      <div *ngFor="let step of steps; let i = index" class="step" [class.active]="step.active" [class.completed]="step.completed">
        <div class="step-icon">
          <span *ngIf="!step.completed">{{ step.icon }}</span>
          <span *ngIf="step.completed">✅</span>
        </div>
        <div class="step-label">{{ step.label }}</div>
        <div *ngIf="i < steps.length - 1" class="step-connector"></div>
      </div>
    </div>
  `,
  styles: [`
    .stepper {
      display: flex;
      justify-content: space-between;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .step {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      gap: 0.5rem;
    }

    .step-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      z-index: 2;
      transition: all 0.3s;
      border: 2px solid transparent;
    }

    .step.active .step-icon {
      border-color: var(--color-primary);
      background: rgba(234, 88, 12, 0.2);
      box-shadow: 0 0 15px rgba(234, 88, 12, 0.4);
    }

    .step.completed .step-icon {
      background: var(--color-primary);
      color: white;
    }

    .step-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      transition: color 0.3s;
    }

    .step.active .step-label {
      color: var(--text-main);
    }

    .step-connector {
      position: absolute;
      top: 20px;
      left: calc(50% + 20px);
      width: calc(100% - 40px);
      height: 2px;
      background: rgba(255, 255, 255, 0.1);
      z-index: 1;
    }

    .step.completed .step-connector {
      background: var(--color-primary);
    }
  `]
})
export class ProgressStepperComponent {
  @Input() steps: Step[] = [];
}
