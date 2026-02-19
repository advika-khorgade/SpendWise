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
import { MatTabsModule } from '@angular/material/tabs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { HttpClient } from '@angular/common/http';
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
    MatTabsModule,
    BaseChartDirective,
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
  email: string = '';
  loading = false;
  filterActive = false;
  successMessage = '';
  errorMessage = '';

  // Chart
  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Expenses by Category',
      },
    },
  };
  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
    }],
  };
  public pieChartType = 'pie' as const;

  // Line chart for trends
  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Spending Trends',
      },
    },
  };
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Spending',
      fill: false,
      tension: 0.1,
    }],
  };
  public lineChartType = 'line' as const;

  constructor(
    private expenseService: ExpenseService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.email = localStorage.getItem('email') || '';
    }
    this.loadExpenses();
    this.loadSummary();
  }

  loadExpenses() {
    this.loading = true;
    this.expenseService.getExpenses(this.email).subscribe({
      next: (res: any) => {
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

  loadSummary() {
    this.expenseService.getSummary(this.email).subscribe({
      next: (summary: any) => {
        const labels = Object.keys(summary);
        const data = Object.values(summary).map(v => Number(v));
        this.pieChartData = {
          labels,
          datasets: [{
            data,
          }],
        };
        this.cdr.markForCheck();
      },
      error: () => {
        // Handle error if needed
      },
    });

    // Load yearly report for trends
    const currentYear = new Date().getFullYear();
    this.http.get<any>(`/api/expenses/yearly-report?email=${this.email}&year=${currentYear}`).subscribe({
      next: (report: any) => {
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = Object.values(report.monthlyTotals).map(v => Number(v));
        this.lineChartData = {
          labels,
          datasets: [{
            data,
            label: 'Monthly Spending',
            fill: false,
            tension: 0.1,
          }],
        };
        this.cdr.markForCheck();
      },
      error: () => {
        // Handle error
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
        next: (res: any) => {
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

