import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ExpenseService } from '../../services/expense.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  total: number = 0;
  summary: any = {};
  email = localStorage.getItem('email') || '';
  loading = true;

  constructor(private expenseService: ExpenseService) {}

  ngOnInit() {
    combineLatest([
      this.expenseService.getTotal(this.email),
      this.expenseService.getSummary(this.email),
    ]).subscribe({
      next: ([total, summary]) => {
        this.total = total || 0;
        this.summary = summary || {};
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  getCategoryIcon(category: string): string {
    const categoryIcons: { [key: string]: string } = {
      food: 'restaurant',
      transport: 'directions_car',
      entertainment: 'movie',
      shopping: 'shopping_cart',
      utilities: 'lightbulb',
      health: 'local_hospital',
      education: 'school',
      other: 'category',
    };
    return categoryIcons[category.toLowerCase()] || 'category';
  }

  getCategoryColor(category: string): string {
    const categoryColors: { [key: string]: string } = {
      food: '#ff6b6b',
      transport: '#4ecdc4',
      entertainment: '#45b7d1',
      shopping: '#f9ca24',
      utilities: '#6c5ce7',
      health: '#a29bfe',
      education: '#00b894',
      other: '#95a5a6',
    };
    return categoryColors[category.toLowerCase()] || '#95a5a6';
  }

  getPercentage(amount: number): number {
    return this.total > 0 ? (amount / this.total) * 100 : 0;
  }

  getSummaryArray() {
    return Object.entries(this.summary).map(([key, value]) => ({
      category: key,
      amount: Number(value) || 0,
    }));
  }

  getHighestCategory(): string {
    const summaryArr = this.getSummaryArray();
    if (summaryArr.length === 0) return '';
    return summaryArr.reduce((max, current) =>
      Number(current.amount) > Number(max.amount) ? current : max
    ).category;
  }

  getAveragePerCategory(): number {
    const summaryArr = this.getSummaryArray();
    return summaryArr.length > 0 ? this.total / summaryArr.length : 0;
  }
}

