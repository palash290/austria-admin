import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SharedService } from '../../../services/shared.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking-management',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './booking-management.component.html',
  styleUrl: './booking-management.component.css'
})
export class BookingManagementComponent {

  allBooking: any;
  searchQuery: any = '';
  filterQuery: any = '';
  allBuses: any;
  allLines: any;
  booking_id: any;
  fromDate: any = '';
  toDate: any = '';
  selectedBusId: any;
  selectedLineId: any = '';

  constructor(private apiService: SharedService, private toastr: NzMessageService) { }

  ngOnInit() {
    this.getAllRoutesFrom();
    this.getBuses();
    this.getRoutes();
  }
  //?booking_status=${this.filterQuery}&search=${this.searchQuery}&start_date=${this.fromDate}&end_date=${this.toDate}&route_id=${this.selectedLineId}
  getAllRoutesFrom() {
    const formData = new URLSearchParams();
    formData.append('booking_status', this.filterQuery);
    formData.append('search', this.searchQuery);
    if (this.fromDate) {
      formData.append('start_date', this.fromDate);
    }
    if (this.toDate) {
      formData.append('end_date', this.toDate);
    }
    if (this.selectedLineId) {
      formData.append('route_id', this.selectedLineId);
    }

    this.apiService
      .postAPI(`get-all-booking`, formData.toString())
      .subscribe((res: any) => {
        if (res.success == true) {
          this.allBooking = res.data;
        }
      });
  }

  patchUpdate(booking_id: any) {
    this.booking_id = booking_id;
  }

  @ViewChild('closeModal2') closeModal2!: ElementRef;

  btnDelLoader: boolean = false;

  deleteBooking() {
    this.btnDelLoader = true;
    this.apiService.getApi(`delete-booking-byid?booking_id=${this.booking_id}`).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.closeModal2.nativeElement.click();
          this.getAllRoutesFrom();
          this.toastr.success(resp.message);
          this.btnDelLoader = false;
        } else {
          this.btnDelLoader = false;
          this.toastr.warning('Something went wrong!');
          this.getAllRoutesFrom();
        }
      },
    });
  }

  getBuses() {
    this.apiService.getApi(`get-all-buses-by-limit-search`).subscribe({
      next: resp => {
        this.allBuses = resp.data.buses;
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  getRoutes() {
    this.apiService.getApi(`get-all-routes`).subscribe({
      next: resp => {
        this.allLines = resp.data;
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  onBusChange(event: any): void {
    const selectedId = event.target.value;
    this.selectedBusId = selectedId;
    console.log(this.selectedBusId);
  }

  onLineChange(event: any): void {
    const selectedId = event.target.value;
    this.selectedLineId = selectedId;
    console.log(this.selectedLineId);
  }

  applyFilters() {
    if (this.selectedBusId == '' && this.selectedLineId == '') {
      return
    }
    this.getAllRoutesFrom();
  }

  resetFilters() {
    this.fromDate = '';
    this.toDate = '';
    this.selectedLineId = '';
    this.getRoutes();
    this.getAllRoutesFrom();
  }


}
