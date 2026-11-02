import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';  

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent } from './home/home.component';
import { HostelPageComponent } from './hostel-page/hostel-page.component';
import { ChatComponent } from './chat/chat.component';
import { NotificationComponent } from './notification/notification.component';
import { NotificationPageComponent } from './notification-page/notification-page.component';
import { PaymentResultComponent } from './payment-result/payment-result.component';
import { TestComponent } from './test/test.component';
import { PaymentComponent } from './payment/payment.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TransactionComponent } from './profile/transaction/transaction.component';
import { FavortComponent } from './profile/favort/favort.component';
import { PersonalDetailsComponent } from './profile/personal-details/personal-details.component';
import { MyprofileComponent } from './profile/myprofile/myprofile.component';
import { AdminUserChatComponent } from './admin-user-chat/admin-user-chat.component';
import { RentPaymentComponent } from './rent-payment/rent-payment.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    SignupComponent,
    HomeComponent,
    HostelPageComponent,
    ChatComponent,
    NotificationComponent,
    NotificationPageComponent,
    PaymentResultComponent,
    TestComponent,
    PaymentComponent,
    TransactionComponent,
    FavortComponent,
    PersonalDetailsComponent,
    MyprofileComponent,
    AdminUserChatComponent,
    RentPaymentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,  
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
