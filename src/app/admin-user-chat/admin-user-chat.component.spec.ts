import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUserChatComponent } from './admin-user-chat.component';

describe('AdminUserChatComponent', () => {
  let component: AdminUserChatComponent;
  let fixture: ComponentFixture<AdminUserChatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminUserChatComponent]
    });
    fixture = TestBed.createComponent(AdminUserChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
