import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SharedService } from '../../../services/shared.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  buses: any;

  constructor(private service: SharedService) { }

  ngOnInit() {
    this.getBuses();
  }

  userCount: any;
  busCount: any;
  driverCount: any;
  routeCount: any;

  getBuses() {
    this.service.getApi('dashboard-details').subscribe({
      next: resp => {
        this.userCount = resp.data.userCount;
        this.busCount = resp.data.busCount;
        this.driverCount = resp.data.bookingCount;
        this.routeCount = resp.data.routeCount;
        if (resp.success && resp.data.userList) {
          this.buses = resp.data.userList
          console.log('Buses:', this.buses);
        } else {
          console.log('No bus data available');
        }
      },
      error: error => {
        console.log(error.message);
      }
    });
  }


}
