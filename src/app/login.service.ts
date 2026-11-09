
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly baseUrl = 'https://hoste-new-backend.onrender.com/api/users';

  constructor(private http: HttpClient) {}

  // Login using email and password
  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, data);
  }

  // Verify login OTP
  verifyLoginOtp(body: {
    email: string;
    otp: string;
  }): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/login/verify-otp`,
      body
    );
  }

  // Resend login OTP.
  // Replace this URL with the actual route defined in your backend.
  resendLoginOtp(body: { email: string }): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/YOUR_LOGIN_RESEND_ENDPOINT`,
      body
    );
  }

  // Register
  register(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/register`,
      data
    );
  }

  // Verify registration OTP
  verifyRegisterOtp(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/register/verify-otp`,
      data
    );
  }

  // Resend registration OTP
  resendRegisterOtp(data: { email: string }): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/register/resend-otp`,
      data
    );
  }
}
