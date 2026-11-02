import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RentPaymentService {
  private apiUrl = 'http://localhost:3200/api/cosmic-payments';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken');

    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  initiatePayment(orderId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${encodeURIComponent(orderId)}/initiate`,
      {},
      { headers: this.getHeaders() }
    );
  }

  checkStatus(orderId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${encodeURIComponent(orderId)}/status`,
      { headers: this.getHeaders() }
    );
  }
}

