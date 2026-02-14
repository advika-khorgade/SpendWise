import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call register API', () => {
    const dummyUser = { name: 'Advika', email: 'advika@test.com', password: '1234' };

    service.register(dummyUser).subscribe((res) => {
      expect(res).toBe('User registered successfully');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush('User registered successfully');
  });

  it('should call login API', () => {
    const loginRequest = { email: 'advika@test.com', password: '1234' };

    service.login(loginRequest).subscribe((res) => {
      expect(res).toBe('Login successful');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush('Login successful');
  });
});
