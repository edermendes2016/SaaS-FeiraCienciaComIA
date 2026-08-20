import { Component, Output, EventEmitter, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.css'
})
export class DashboardHeaderComponent {
  themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  @Output() newProject = new EventEmitter<void>();
  @Output() home = new EventEmitter<void>();

  onHome() {
    this.home.emit();
  }

  onNewProject() {
    this.newProject.emit();
  }

  onToggleTheme() {
    this.themeService.toggleTheme();
  }

  async onLogout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  }
}

