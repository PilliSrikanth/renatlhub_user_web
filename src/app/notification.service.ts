
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppNotification {
  _id: string;
  recipientId?: string;
  recipientType?: 'user' | 'owner' | 'admin';
  senderId?: string;
  senderType?: string;
  title: string;
  message: string;
  type: string;
  referenceId?: string;
  referenceType?: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationResponse {
  success?: boolean;
  message?: string;
  notifications: AppNotification[];
  total?: number;
  unreadCount?: number;
  page?: number;
  totalPages?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = 'http://localhost:3200/api/notification';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('userToken');
      console.log({
  tokenExists: !!localStorage.getItem('token'),
  userTokenExists: !!localStorage.getItem('userToken')
});

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  getNotifications(
    page: number = 1,
    limit: number = 20
  ): Observable<NotificationResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<NotificationResponse>(this.apiUrl, {
      headers: this.getHeaders(),
      params
    });
  }

  getUnreadCount(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/unread-count`,
      { headers: this.getHeaders() }
    );
  }

  markAsRead(id: string): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/${id}/read`,
      {},
      { headers: this.getHeaders() }
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/read-all`,
      {},
      { headers: this.getHeaders() }
    );
  }

  deleteNotification(id: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }
}