import { Component } from '@angular/core';

@Component({
  selector: 'app-refer',
  templateUrl: './refer.component.html',
  styleUrls: ['./refer.component.css']
})
export class ReferComponent { 
  referralCode = 'HOSTEL250'; 
  referralReward = 100; 
  totalReferrals = 0; 
  successfulReferrals = 0; 
  totalRewards = 0; 
  referralHistory: any[] = []; 
  copyReferralCode(): void { 
    navigator.clipboard.writeText(this.referralCode); 
    alert('Referral code copied!');
   } 
   shareWhatsApp(): void { 
    const message = `Join our hostel & rental platform using my referral code ${this.referralCode}. ` + `Register now and get exciting benefits!`; 
    const url = 'https://wa.me/?text=' + encodeURIComponent(message); 
    window.open(url, '_blank');
   } 
   async shareReferral(): Promise<void> { 
    const shareData = { 
      title: 'Refer & Earn', 
      text: `Join our hostel & rental platform using my referral code ${this.referralCode}.`, 
      url: window.location.origin 
    }; 
    if (navigator.share) { 
      try { 
        await navigator.share(shareData); 
      } 
      catch (error) { 
        console.log('Share cancelled');
       }
       }
        else { 
          this.copyReferralCode(); 
        }
       }
       }