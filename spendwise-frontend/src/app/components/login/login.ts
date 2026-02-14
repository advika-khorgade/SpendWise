import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  loading = false;
  error = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    if (!this.email || !this.password) {
      this.error = 'Please enter both email and password';
      return;
    }

    this.loading = true;
    this.error = '';

    console.log('Attempting login with:', this.email);
    console.log('Request body:', { email: this.email, password: this.password });
    
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('Login response received:', response);
        console.log('Response type:', typeof response);
        if (response.success) {
          console.log('✅ Login successful, storing email and navigating');
          localStorage.setItem('email', this.email);
          this.router.navigate(['/dashboard']).then(success => {
            console.log('Navigation to dashboard:', success);
          });
        } else {
          console.log('❌ Login failed with response:', response.message);
          this.error = response.message || 'Login failed';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ LOGIN ERROR OCCURRED:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error body:', err.error);
        console.error('Full error object:', err);
        this.error = 'An error occurred. Please try again.';
        this.loading = false;
      },
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}

