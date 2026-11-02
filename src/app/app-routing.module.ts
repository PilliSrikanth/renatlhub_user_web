import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent } from './home/home.component';
import { HostelPageComponent } from './hostel-page/hostel-page.component';
import { ChatComponent } from './chat/chat.component';
import { RegisterComponent } from './register/register.component';
import { NotificationComponent } from './notification/notification.component';
import { NotificationPageComponent } from './notification-page/notification-page.component';
import { PaymentResultComponent } from './payment-result/payment-result.component';
import { TestBed } from '@angular/core/testing';
import { TestComponent } from './test/test.component';
import { PaymentComponent } from './payment/payment.component';
import { MyprofileComponent } from './profile/myprofile/myprofile.component';
import { TransactionComponent } from './profile/transaction/transaction.component';
import { PersonalDetailsComponent } from './profile/personal-details/personal-details.component';
import { ReferComponent } from './profile/refer/refer.component';
import { FavortComponent } from './profile/favort/favort.component';
import { AdminUserChatComponent } from './admin-user-chat/admin-user-chat.component';
import { RentPaymentComponent } from './rent-payment/rent-payment.component';

const routes: Routes = [
  { path: '', component:LoginComponent},
  { path: 'register', component: RegisterComponent },
  { path:'login', component:LoginComponent},
  { path:'home', component:HomeComponent},
  { path: 'hostel/:id', component:HostelPageComponent },
  { path: 'chat/:ownerId/:hostelId', component: ChatComponent },
  { path:'notification', component:NotificationComponent},
  { path:'notification-details/:id', component:NotificationPageComponent},
  { path:'payment/:status/:txnid', component: PaymentResultComponent},
  {path:'payment', component:PaymentComponent},
  {path:'myprofile', component:MyprofileComponent},
  {path:'personaldetails', component:PersonalDetailsComponent},
  {path:'transaction', component:TransactionComponent},
  {path:'refer',component:ReferComponent},
  {path:'favorate', component:FavortComponent},
  {
  path: 'admin-user-chat/:adminId',
  component: AdminUserChatComponent
},
  {path: 'rent-payment',  component: RentPaymentComponent}
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
