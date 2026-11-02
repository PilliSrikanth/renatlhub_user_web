import { Component } from '@angular/core';
import { RentPaymentService } from '../rent-payment.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-rent-payment',
  templateUrl: './rent-payment.component.html',
  styleUrls: ['./rent-payment.component.css']
})
export class RentPaymentComponent  {
  orderId = '';
  paymentUrl = '';
  paymentStatus = '';
  loading = false;
  errorMessage = '';

  constructor(
    private cosmicPayment: RentPaymentService
  ) {}

  payRent(): void {
    if (!this.orderId.trim()) {
      this.errorMessage = 'Rent payment order ID is required';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.cosmicPayment.initiatePayment(this.orderId).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.success && response.paymentUrl) {
          this.paymentUrl = response.paymentUrl;
          window.location.assign(response.paymentUrl);
        } else {
          this.errorMessage = 'Could not create payment session';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error.error?.message || 'Payment initiation failed';
      }
    });
  }

  verifyPayment(): void {
    if (!this.orderId.trim()) return;

    this.cosmicPayment.checkStatus(this.orderId).subscribe({
      next: (response) => {
        this.paymentStatus = response.paymentStatus;

        if (response.paymentStatus === 'paid') {
          alert('Rent payment verified successfully');
        } else {
          alert('Payment is not confirmed yet. Please check again.');
        }
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Could not verify payment';
      }
    });
  }
}