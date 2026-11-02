import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  baseUrl = "http://localhost:3200";

  constructor(private http: HttpClient) { }

  getPayment(body:any){
    return this.http.post(`${this.baseUrl}/get-payment`, body, {responseType:'text'});
  }

    getUserTransactions(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}`);
  }
  private apiUrl = 'http://localhost:3200/api/users'; // your Node backend base URL


  // Get user details + transactions + hostel details
  getUserDetails(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`);
  }

}
