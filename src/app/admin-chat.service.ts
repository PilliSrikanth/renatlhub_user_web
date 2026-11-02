import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class AdminChatService {

  private apiUrl =
    'http://localhost:3200/api/admin-chat';

  private socket: Socket;

  constructor(
    private http: HttpClient
  ) {

    this.socket = io(
      'http://localhost:3200',
      {
        transports: ['websocket', 'polling']
      }
    );

  }


  // =====================================================
  // USER JOIN
  // =====================================================

  joinUser(userId: string) {

    this.socket.emit(
      'admin-chat:join-user',
      userId
    );

  }


  // =====================================================
  // ADMIN JOIN
  // =====================================================

  joinAdmin(adminId: string) {

    this.socket.emit(
      'admin-chat:join-admin',
      adminId
    );

  }


  // =====================================================
  // SEND MESSAGE
  // =====================================================


sendMessage(data: any): Observable<any> {
  return this.http.post<any>(
    `${this.apiUrl}/send`,
    data
  );
}



  // =====================================================
  // RECEIVE MESSAGE
  // =====================================================

  onMessage(): Observable<any> {

    return new Observable(
      observer => {

        this.socket.on(
          'admin-chat:message',
          (message) => {

            observer.next(message);

          }
        );

        return () => {

          this.socket.off(
            'admin-chat:message'
          );

        };

      }
    );

  }


  // =====================================================
  // SOCKET ERROR
  // =====================================================

  onError(): Observable<any> {

    return new Observable(
      observer => {

        this.socket.on(
          'admin-chat:error',
          (error) => {

            observer.next(error);

          }
        );

      }
    );

  }


  // =====================================================
  // GET CONVERSATION
  // =====================================================

  getConversation(
    userId: string,
    adminId: string
  ) {

    return this.http.get<any>(
      `${this.apiUrl}/conversation/${userId}/${adminId}`
    );

  }


  // =====================================================
  // GET ADMIN CONVERSATIONS
  // =====================================================

  getAdminConversations(
    adminId: string
  ) {

    return this.http.get<any>(
      `${this.apiUrl}/admin/${adminId}`
    );

  }


  // =====================================================
  // MARK READ
  // =====================================================

  markAsRead(
    userId: string,
    adminId: string,
    readerType: 'user' | 'admin'
  ) {

    return this.http.put<any>(
      `${this.apiUrl}/read`,
      {
        userId,
        adminId,
        readerType
      }
    );

  }


  // =====================================================
  // UNREAD COUNT
  // =====================================================

  getUnreadCount(
    userId: string,
    adminId: string,
    readerType: string
  ) {

    return this.http.get<any>(
      `${this.apiUrl}/unread/${userId}/${adminId}/${readerType}`
    );

  }
  

}
