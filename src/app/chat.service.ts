import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  // REST API
  baseUrl = "http://localhost:3200/api/chat";

  // SOCKET.IO connection
  socket: any;

  constructor(private http: HttpClient) {
    // Connect to backend socket server
    this.socket = io("https://hostel-backend-cfh3.onrender.com", {
      transports: ["websocket", "polling"]
    });
  }

  // ➤ Send chat message (HTTP API)
  sendMessage(data: any) {
    return this.http.post(`${this.baseUrl}/send`, data);
  }

  // ➤ Load old messages
  getMessages(userId: string, ownerId: string, hostelId: string) {
    return this.http.get(`${this.baseUrl}/${userId}/${ownerId}/${hostelId}`);
  }

  // ➤ Listen for real-time new messages
  listenForMessages(): Observable<any> {
    return new Observable(observer => {
      this.socket.on("newMessage", (msg: any) => {
        observer.next(msg);
      });
    });
  }
}
