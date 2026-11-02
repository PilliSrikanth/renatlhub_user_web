import { Component } from '@angular/core';

interface Transaction {
  name: string;
  amount: number;
  date: string;
  method: string;
  methodIcon: string;
}

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent {

  // Search text
  searchText: string = '';

  // Selected tab
  selectedTab: string = 'all';

  // Transactions
  transactions: Transaction[] = [
    {
      name: 'Mekala Ravi Teja',
      amount: 250,
      date: 'July 14 6:35 PM',
      method: 'Paytm',
      methodIcon: 'assets/paytm.png'
    },
    {
      name: 'Mekala Ravi Teja',
      amount: 250,
      date: 'July 14 6:35 PM',
      method: 'PhonePe',
      methodIcon: 'assets/phonepe.png'
    },
    {
      name: 'Mekala Ravi Teja',
      amount: 250,
      date: 'July 14 6:35 PM',
      method: 'Google Pay',
      methodIcon: 'assets/gpay.png'
    },
    {
      name: 'Mekala Ravi Teja',
      amount: 250,
      date: 'July 14 6:35 PM',
      method: 'UPI',
      methodIcon: 'assets/upi.png'
    },
    {
      name: 'Mekala Ravi Teja',
      amount: 250,
      date: 'July 14 6:35 PM',
      method: 'Visa',
      methodIcon: 'assets/visa.png'
    },
    {
      name: 'Mekala Ravi Teja',
      amount: 250,
      date: 'July 14 6:35 PM',
      method: '',
      methodIcon: ''
    },
    {
      name: 'Mekala Ravi Teja',
      amount: 250,
      date: 'July 14 6:35 PM',
      method: '',
      methodIcon: ''
    },
    {
      name: 'Mekala Ravi Teja',
      amount: 250,
      date: 'July 14 6:35 PM',
      method: '',
      methodIcon: ''
    },
    {
      name: 'Mekala Ravi Teja',
      amount: 250,
      date: 'July 14 6:35 PM',
      method: '',
      methodIcon: ''
    }
  ];

  // Filter transactions
  get filteredTransactions(): Transaction[] {

    if (!this.searchText.trim()) {
      return this.transactions;
    }

    const search = this.searchText.toLowerCase();

    return this.transactions.filter(transaction =>
      transaction.name.toLowerCase().includes(search) ||
      transaction.amount.toString().includes(search)
    );
  }

  // Pay Now
  payNow(): void {
    console.log('Pay Now clicked');
  }

}