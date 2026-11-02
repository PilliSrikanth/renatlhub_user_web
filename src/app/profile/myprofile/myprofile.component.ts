import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-myprofile',
  templateUrl: './myprofile.component.html',
  styleUrls: ['./myprofile.component.css']
})
export class MyprofileComponent {

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
