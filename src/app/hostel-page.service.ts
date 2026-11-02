import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HostelPageService {
  private baseUrl = 'http://localhost:3200/api'; // Replace with your backend URL
  constructor(private http: HttpClient) {}


    sendRequest(data: any) {
    return this.http.post(`${this.baseUrl}/requests/send`, data);
  }

  getHostelReviews(hostelId: string) {
    return this.http.get(`${this.baseUrl}/reviews/hostel/${hostelId}`);
  }

  addReview(data: any) {
    return this.http.post(`${this.baseUrl}/reviews/add`, data);
  }
}