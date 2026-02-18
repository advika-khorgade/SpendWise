import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { ExpensesComponent } from './components/expenses/expenses';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'expenses', component: ExpensesComponent },
  { path: '**', redirectTo: '/login' }
];
