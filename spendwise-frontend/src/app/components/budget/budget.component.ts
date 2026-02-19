import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-budget',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css',
})
export class BudgetComponent implements OnInit {
  budgets: any[] = [];
  email: string = '';
  loading = false;

  // Form fields
  category: string = '';
  amount: number = 0;
  period: string = 'monthly';
  startDate: Date = new Date();
  endDate: Date = new Date();

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.email = localStorage.getItem('email') || '';
    }
    this.loadBudgets();
  }

  loadBudgets() {
    this.loading = true;
    this.http.get<any[]>(`/api/budgets?email=${this.email}`).subscribe({
      next: (data) => {
        this.budgets = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load budgets', 'Close', { duration: 3000 });
      },
    });
  }

  addBudget() {
    if (!this.category || !this.amount || !this.startDate || !this.endDate) {
      this.snackBar.open('Please fill all fields', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    const params = {
      email: this.email,
      category: this.category,
      amount: this.amount,
      period: this.period,
      startDate: this.startDate.toISOString().split('T')[0],
      endDate: this.endDate.toISOString().split('T')[0],
    };

    this.http.post('/api/budgets', null, { params }).subscribe({
      next: () => {
        this.loadBudgets();
        setTimeout(() => this.resetForm(), 0);
        this.snackBar.open('Budget added successfully', 'Close', { duration: 3000 });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to add budget', 'Close', { duration: 3000 });
      },
    });
  }

  deleteBudget(id: number) {
    this.http.delete(`/api/budgets/${id}`).subscribe({
      next: () => {
        this.loadBudgets();
        this.snackBar.open('Budget deleted', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to delete budget', 'Close', { duration: 3000 });
      },
    });
  }

  resetForm() {
    this.category = '';
    this.amount = 0;
    this.startDate = new Date();
    this.endDate = new Date();
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      food: '#ff6b6b',
      transport: '#4ecdc4',
      entertainment: '#45b7d1',
      shopping: '#f9ca24',
      utilities: '#6c5ce7',
      health: '#a29bfe',
      education: '#00b894',
      other: '#95a5a6',
    };
    return colors[category] || '#95a5a6';
  }
}