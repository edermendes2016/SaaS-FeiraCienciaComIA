import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  async onSubmit() {
    if (this.loginForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    try {
      await this.authService.login(email!, password!);
      
      // Busca dados extras do usuário no Firestore (Perfil, Role, Approved)
      const sub = this.authService.userData$.subscribe(userData => {
        if (userData) {
          sub.unsubscribe(); // Evita loops de redirecionamento
          
          if (userData['role'] === 'teacher' && !userData['approved']) {
            this.authService.logout();
            this.router.navigate(['/waiting-approval']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      });
    } catch (error: any) {
      this.errorMessage = error.message;
      this.toast.error('Email ou senha incorretos. Tente novamente.');
    } finally {
      this.isLoading = false;
    }
  }

  async signInWithGoogle() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = '';
    try {
      await this.authService.loginWithGoogle();
    } catch (error: any) {
      this.errorMessage = error.message;
      this.toast.error('Erro ao autenticar com Google.');
    } finally {
      this.isLoading = false;
    }
  }
}
