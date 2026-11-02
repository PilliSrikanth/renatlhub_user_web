
import { Component } from '@angular/core';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

type OtpPurpose = 'login' | 'register' | null;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLogin = true;
  loading = false;
  otpMode = false;
  otp = '';
  resendLoading = false;
  otpPurpose: OtpPurpose = null;

  login = {
    email: '',
    password: ''
  };

  register = {
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  private getUserFromResponse(res: any): any {
    return res?.user || res?.data?.user || res?.data || res;
  }


private saveUserSession(res: any): boolean {
  const user = res?.user || res?.data?.user || res?.data;

  const userId =
    user?._id ||
    user?.id ||
    user?.userId ||
    res?.userId ||
    res?.data?.userId;

  const token =
    res?.token ||
    res?.accessToken ||
    res?.data?.token ||
    res?.data?.accessToken;

  if (!userId || !token) {
    console.error('Authentication response is missing user ID or token.', {
      hasUserId: Boolean(userId),
      hasToken: Boolean(token)
    });
    return false;
  }

  localStorage.setItem('userId', String(userId));
  localStorage.setItem('token', token);
  localStorage.setItem('userName', user?.name || '');
  localStorage.setItem(
    'userEmail',
    user?.email ||
      this.register.email.trim().toLowerCase() ||
      this.login.email.trim().toLowerCase()
  );

  console.log('Authenticated user ID:', String(userId));
  console.log('JWT saved:', Boolean(localStorage.getItem('token')));

  return true;
}


  // LOGIN
  loginUser(): void {
    const email = this.login.email.trim().toLowerCase();

    if (!email || !this.login.password) {
      alert('Please enter email and password');
      return;
    }

    this.loading = true;

    this.loginService.login({
      email,
      password: this.login.password
    }).subscribe({
      next: (res: any) => {
        this.loading = false;
        console.log('LOGIN RESPONSE:', res);

        if (res?.otpRequired === true ||
            res?.data?.otpRequired === true) {
          this.register.email =
            res?.email || res?.data?.email || email;

          this.otp = '';
          this.otpPurpose = 'login';
          this.otpMode = true;
          return;
        }

        if (!this.saveUserSession(res)) {
          alert('User ID missing in login response. Check your backend.');
          return;
        }

        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        this.loading = false;
        console.error('LOGIN FAILED:', err);
        alert(err?.error?.message || 'Login failed');
      }
    });
  }

  // REGISTER
  registerUser(): void {
    if (
      !this.register.name.trim() ||
      !this.register.email.trim() ||
      !this.register.password ||
      !this.register.confirmPassword
    ) {
      alert('Please fill all required fields');
      return;
    }

    if (this.register.password !== this.register.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const email = this.register.email.trim().toLowerCase();

    const body = {
      name: this.register.name.trim(),
      email,
      mobile: this.register.mobile.trim(),
      password: this.register.password,
      confirmPassword: this.register.confirmPassword
    };

    this.loading = true;

    this.loginService.register(body).subscribe({
      next: (res: any) => {
        this.loading = false;
        console.log('REGISTER RESPONSE:', res);

        this.register.email =
          res?.email || res?.data?.email || email;

        this.otp = '';
        this.otpPurpose = 'register';
        this.otpMode = true;

        alert('OTP sent to your email');
      },
      error: (err: any) => {
        this.loading = false;
        console.error('REGISTER FAILED:', err);
        alert(err?.error?.message || 'Registration failed');
      }
    });
  }

  // VERIFY LOGIN OR REGISTRATION OTP
  verifyOtp(): void {
    const email = this.register.email.trim().toLowerCase();
    const enteredOtp = this.otp.trim();

    if (!email) {
      alert('Email is missing');
      return;
    }

    if (!/^\d{6}$/.test(enteredOtp)) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    if (!this.otpPurpose) {
      alert('OTP verification type is missing. Please try again.');
      return;
    }

    const body = { email, otp: enteredOtp };

    // Both methods must return Observable objects from LoginService.
    const request$: Observable<any> =
      this.otpPurpose === 'login'
        ? this.loginService.verifyLoginOtp(body)
        : this.loginService.verifyRegisterOtp(body);

    this.loading = true;

    request$.subscribe({
      next: (res: any) => {
        this.loading = false;
        console.log('OTP VERIFICATION RESPONSE:', res);

        if (!this.saveUserSession(res)) {
          alert(
            'OTP verified, but the response has no user ID. ' +
            'Check your backend verification response.'
          );
          return;
        }

        alert(
          this.otpPurpose === 'login'
            ? 'Login successful'
            : 'Registration successful'
        );

        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        this.loading = false;
        console.error('OTP VERIFICATION FAILED:', err);
        alert(err?.error?.message || 'OTP verification failed');
      }
    });
  }

  // RESEND OTP
  resendOtp(): void {
    const email = this.register.email.trim().toLowerCase();

    if (!email) {
      alert('Email is missing');
      return;
    }

    if (!this.otpPurpose) {
      alert('OTP verification type is missing');
      return;
    }

    const request$: Observable<any> =
      this.otpPurpose === 'login'
        ? this.loginService.resendLoginOtp({ email })
        : this.loginService.resendRegisterOtp({ email });

    this.resendLoading = true;

    request$.subscribe({
      next: (res: any) => {
        this.resendLoading = false;
        this.otp = '';
        console.log('OTP RESENT:', res);
        alert('New OTP sent to your email');
      },
      error: (err: any) => {
        this.resendLoading = false;
        console.error('RESEND OTP FAILED:', err);
        alert(err?.error?.message || 'Failed to resend OTP');
      }
    });
  }

  // BACK TO FORM
  backToForm(): void {
    this.otpMode = false;
    this.otp = '';
    this.otpPurpose = null;
  }

  // SWITCH LOGIN / REGISTER
  switchMode(loginMode: boolean): void {
    this.isLogin = loginMode;
    this.otpMode = false;
    this.otp = '';
    this.otpPurpose = null;
  }
}
