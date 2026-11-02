import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private baseUrl = 'http://localhost:3200/api/requests'; // ✅ your Express base route

  constructor(private http: HttpClient) {}

  // 🔹 Get all requests for a user
  getUserRequests(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}`);
  }

  // 🔹 Update request status (Accept / Decline)
  updateStatus(requestId: string, status: 'accepted' | 'declined'): Observable<any> {
    return this.http.put(`${this.baseUrl}/${requestId}/status`, { status });
  }
}