
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminChatService } from '../admin-chat.service';

@Component({
  selector: 'app-admin-user-chat',
  templateUrl: './admin-user-chat.component.html',
  styleUrls: ['./admin-user-chat.component.css']
})
export class AdminUserChatComponent implements OnInit, OnDestroy {
  userId = '';
  adminId = '';
  messageText = '';
  messages: any[] = [];
  loading = false;

  private messageSubscription?: Subscription;
  private routeSubscription?: Subscription;
  private initialized = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: AdminChatService
  ) {}

  ngOnInit(): void {
    this.userId = this.getValidId(localStorage.getItem('userId'));

    if (!this.userId) {
      console.error('User ID missing. Please log in again.');
      return;
    }

    // Supports /admin-user-chat/:adminId and ?adminId=...
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const routeAdminId = params.get('adminId');

      this.route.queryParamMap.subscribe(queryParams => {
        const queryAdminId = queryParams.get('adminId');

        this.adminId = this.getValidId(routeAdminId || queryAdminId);

        if (!this.adminId) {
          console.error(
            'Admin ID missing. Open chat using a valid admin ID.'
          );
          return;
        }

        if (!this.initialized) {
          this.initialized = true;
          this.initializeChat();
        }
      });
    });
  }

  private getValidId(value: string | null): string {
    const id = (value || '').trim();

    if (!id || id === 'undefined' || id === 'null') {
      return '';
    }

    return id;
  }

  private initializeChat(): void {
    console.log('Chat userId:', this.userId);
    console.log('Chat adminId:', this.adminId);

    // Subscribe before joining the room.
    this.messageSubscription = this.chatService
      .onMessage()
      .subscribe((message: any) => {
        console.log('Socket message received:', message);

        if (!message) {
          return;
        }

        if (
          message._id &&
          this.messages.some(
            item => String(item._id) === String(message._id)
          )
        ) {
          return;
        }

        this.messages = [...this.messages, message];
        setTimeout(() => this.scrollToBottom(), 50);
      });

    this.chatService.joinUser(this.userId);
    this.loadMessages();

    this.chatService
      .markAsRead(this.userId, this.adminId, 'user')
      .subscribe({
        error: err => console.error('Mark as read failed:', err)
      });
  }

  loadMessages(): void {
    if (!this.userId || !this.adminId) {
      return;
    }

    this.loading = true;

    this.chatService
      .getConversation(this.userId, this.adminId)
      .subscribe({
        next: (res: any) => {
          const history = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.messages)
              ? res.messages
              : [];

          // Keep history and messages received while loading, without
          // duplicating messages that have database IDs.
          const merged = [...history, ...this.messages];
          const seenIds = new Set<string>();

          this.messages = merged.filter((item: any) => {
            if (!item?._id) {
              return true;
            }

            const id = String(item._id);

            if (seenIds.has(id)) {
              return false;
            }

            seenIds.add(id);
            return true;
          });

          this.loading = false;
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: err => {
          console.error('Chat loading error:', err);
          this.loading = false;
        }
      });
  }



sendMessage(): void {
  const message = this.messageText.trim();

  if (!message || !this.userId || !this.adminId) {
    console.error('Message, userId, or adminId is missing.');
    return;
  }

  const payload = {
    userId: this.userId,
    adminId: this.adminId,
    senderType: 'user',
    message
  };

  console.log('Sending chat payload:', payload);

  this.chatService.sendMessage(payload).subscribe({
    next: (res: any) => {
      console.log('Send message API response:', res);

      if (!res?.success || !res?.data) {
        console.error('Message was not saved:', res);
        return;
      }

      const savedMessage = res.data;

      const exists = this.messages.some(
        item => item._id &&
          String(item._id) === String(savedMessage._id)
      );

      if (!exists) {
        this.messages = [...this.messages, savedMessage];
      }

      this.messageText = '';
      setTimeout(() => this.scrollToBottom(), 50);
    },
    error: (err: any) => {
      console.error('Send message failed:', err);
      console.error('Backend response:', err?.error);
    }
  });
}



  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom(): void {
    const element = document.getElementById('chatMessages');

    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }

  ngOnDestroy(): void {
    this.messageSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }
}
