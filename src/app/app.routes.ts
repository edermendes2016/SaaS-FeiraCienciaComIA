import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { authGuard } from './guards/auth.guard';
import { Dashboard } from './pages/dashboard/dashboard';
import { Register } from './pages/register/register';
import { WaitingApproval } from './pages/waiting-approval/waiting-approval';
import { ProjectGenerator } from './pages/project-generator/project-generator';
import { ProjectDetails } from './pages/project-details/project-details';

import { LandingPage } from './pages/landing-page/landing-page.component';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'waiting-approval', component: WaitingApproval },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'gerar', component: ProjectGenerator, canActivate: [authGuard] },
  { path: 'projeto/:id', component: ProjectDetails, canActivate: [authGuard] },
];
