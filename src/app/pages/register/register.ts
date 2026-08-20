import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthValidators } from '../../utils/auth-validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    schoolName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    role: ['student', [Validators.required]],
    grade: [''],
    class: [''],
    password: ['', [Validators.required, AuthValidators.passwordStrength()]]
  });

  async onSubmit() {
    if (this.registerForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password, schoolName, role, grade, class: className } = this.registerForm.value;

    try {
      const isTeacher = role === 'teacher';
      const approved = true; // Temporariamente aprovado automaticamente

      await this.authService.register(email!, password!, name!, {
        schoolName,
        role,
        grade,
        class: className,
        approved
      });

      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Erro detalhado no registro:', error);
      this.errorMessage = error.message || 'Erro ao criar conta. Verifique os dados.';
    } finally {
      this.isLoading = false;
    }
  }
}
