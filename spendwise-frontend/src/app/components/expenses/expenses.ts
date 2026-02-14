import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-expenses',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.css',
})
export class ExpensesComponent implements OnInit {
  expenses: any[] = [];
  displayedColumns: string[] = ['title', 'amount', 'category', 'date', 'actions'];
  title = '';
  amount = 0;
  category = '';
  date: any;
  startDate: any;
  endDate: any;
  email = localStorage.getItem('email') || '';
  loading = false;
  filterActive = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private expenseService: ExpenseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadExpenses();
  }

  loadExpenses() {
    this.loading = true;
    this.expenseService.getExpenses(this.email).subscribe({
      next: (res) => {
        this.expenses = res;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load expenses';
        this.cdr.markForCheck();
      },
    });
  }

  addExpense() {
    if (!this.title || !this.amount || !this.category || !this.date) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const formattedDate = this.formatDate(this.date);
    
    this.expenseService
      .addExpense(
        { title: this.title, amount: this.amount, category: this.category, date: formattedDate },
        this.email
      )
      .subscribe({
        next: (response: any) => {
          console.log('✅ Expense added:', response);
          this.successMessage = 'Expense added successfully!';
          this.resetForm();
          this.loadExpenses();
          this.loading = false;
          this.cdr.markForCheck();
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (err: any) => {
          console.error('❌ Add expense failed:', err);
          this.errorMessage = 'Failed to add expense';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  deleteExpense(id: number) {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe({
        next: () => {
          this.successMessage = 'Expense deleted successfully!';
          this.loadExpenses();
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: () => {
          this.errorMessage = 'Failed to delete expense';
          this.cdr.markForCheck();
        },
      });
    }
  }

  filterExpenses() {
    if (!this.startDate || !this.endDate) {
      this.errorMessage = 'Please select both start and end dates';
      return;
    }

    if (this.startDate > this.endDate) {
      this.errorMessage = 'Start date must be before end date';
      return;
    }

    this.loading = true;
    this.expenseService
      .filterByDate(
        this.email,
        this.formatDate(this.startDate),
        this.formatDate(this.endDate)
      )
      .subscribe({
        next: (res) => {
          this.expenses = res;
          this.filterActive = true;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Failed to filter expenses';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  resetFilter() {
    this.startDate = null;
    this.endDate = null;
    this.filterActive = false;
    this.loadExpenses();
  }

  resetForm() {
    this.title = '';
    this.amount = 0;
    this.category = '';
    this.date = null;
    this.errorMessage = '';
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
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
    return colors[category.toLowerCase()] || '#95a5a6';
  }
}

