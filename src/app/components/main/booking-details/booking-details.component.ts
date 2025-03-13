import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SharedService } from '../../../services/shared.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [RouterLink, DatePipe, CommonModule],
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.css'
})
export class BookingDetailsComponent {

  id: any;
  ticketData: any;
  passengersDetails: any;

  constructor(private apiService: SharedService, private route: ActivatedRoute, private router: Router, private toastr: NzMessageService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.id = params['booking_id'];
      console.log('this.id', this.id);
      this.getTicketDetails(this.id);
    });
  }


  getTicketDetails(id: any) {
    this.apiService.getApi(`get-ticket-booking-by-booking-id?id=${id}`).subscribe({
      next: (resp: any) => {
        this.ticketData = resp.data[0];
        this.passengersDetails = resp.data[0].passengers;
      },
      error: error => {
        console.log(error.message);
      }
    });
  }
  

}
