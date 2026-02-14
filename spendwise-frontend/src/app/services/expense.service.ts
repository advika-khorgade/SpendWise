import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private baseUrl = '/api/expenses';

  constructor(private http: HttpClient) {}

  getExpenses(email: string): Observable<any> {
    return this.http.get(`${this.baseUrl}?email=${email}`).pipe(
      catchError(error => {
        console.error('❌ Get expenses error:', error);
        return throwError(() => error);
      })
    );
  }

  addExpense(expense: any, email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}?email=${email}`, expense).pipe(
      catchError(error => {
        console.error('❌ Add expense error:', error);
        console.error('Status:', error.status);
        console.error('Status text:', error.statusText);
        console.error('Error body:', error.error);
        return throwError(() => error);
      })
    );
  }

  updateExpense(id: number, expense: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, expense).pipe(
      catchError(error => {
        console.error('❌ Update expense error:', error);
        return throwError(() => error);
      })
    );
  }

  deleteExpense(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      catchError(error => {
        console.error('❌ Delete expense error:', error);
        return throwError(() => error);
      })
    );
  }

  getTotal(email: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/total?email=${email}`).pipe(
      catchError(error => {
        console.error('❌ Get total error:', error);
        return throwError(() => error);
      })
    );
  }

  getSummary(email: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/summary?email=${email}`).pipe(
      catchError(error => {
        console.error('❌ Get summary error:', error);
        return throwError(() => error);
      })
    );
  }

  filterByDate(email: string, start: string, end: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/filter?email=${email}&startDate=${start}&endDate=${end}`
    ).pipe(
      catchError(error => {
        console.error('❌ Filter by date error:', error);
        return throwError(() => error);
      })
    );
  }
}
