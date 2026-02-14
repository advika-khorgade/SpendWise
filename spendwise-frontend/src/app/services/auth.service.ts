import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, user).pipe(
      catchError(error => {
        console.error('❌ Register HTTP error:', error);
        console.error('Status:', error.status);
        console.error('Status text:', error.statusText);
        console.error('URL:', error.url);
        return throwError(() => error);
      })
    );
  }

  login(loginRequest: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, loginRequest).pipe(
      catchError(error => {
        console.error('❌ Login HTTP error:', error);
        console.error('Status:', error.status);
        console.error('Status text:', error.statusText);
        console.error('URL:', error.url);
        return throwError(() => error);
      })
    );
  }
}
