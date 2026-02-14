import { TestBed } from '@angular/core/testing';
import { ExpenseService } from './expense.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let httpMock: HttpTestingController;
  const email = 'advika@test.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExpenseService],
    });

    service = TestBed.inject(ExpenseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all expenses', () => {
    const dummyExpenses = [
      { id: 1, title: 'Food', amount: 100, category: 'Food', date: '2026-02-14' },
      { id: 2, title: 'Travel', amount: 50, category: 'Travel', date: '2026-02-14' },
    ];

    service.getExpenses(email).subscribe((res) => {
      expect(res.length).toBe(2);
      expect(res).toEqual(dummyExpenses);
    });

    const req = httpMock.expectOne(`http://localhost:8080/api/expenses?email=${email}`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyExpenses);
  });

  it('should add an expense', () => {
    const newExpense = { title: 'Books', amount: 200, category: 'Education', date: '2026-02-14' };

    service.addExpense(newExpense, email).subscribe((res) => {
      expect(res).toBe('Expense added successfully');
    });

    const req = httpMock.expectOne(`http://localhost:8080/api/expenses?email=${email}`);
    expect(req.request.method).toBe('POST');
    req.flush('Expense added successfully');
  });
});
