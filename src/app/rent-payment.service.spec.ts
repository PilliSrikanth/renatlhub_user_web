import { TestBed } from '@angular/core/testing';

import { RentPaymentService } from './rent-payment.service';

describe('RentPaymentService', () => {
  let service: RentPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RentPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
