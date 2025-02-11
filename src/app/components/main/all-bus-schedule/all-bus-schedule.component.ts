import { Component } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-all-bus-schedule',
  standalone: true,
  imports: [HeaderComponent, CommonModule, FormsModule],
  templateUrl: './all-bus-schedule.component.html',
  styleUrl: './all-bus-schedule.component.css'
})
export class AllBusScheduleComponent {
  totalPagesArray: number[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  pageSizeOptions = [5, 10, 25, 50];
  searchQuery: any = '';
  filterQuery: any = ''
  data: any;

  constructor(private service: SharedService) { }

  ngOnInit() {
    this.getBuseSchedule();
  }

  noOfStops: any;

  getBuseSchedule() {

    this.service.getApi(`get-all-busschedule?page=${this.currentPage}&limit=${this.pageSize}&search=${this.searchQuery}&filter=${this.filterQuery}`).subscribe({
      next: resp => {
        //debugger
        this.data = resp.data.schedulesWithStops;
        
        this.noOfStops = resp.data.schedulesWithStops[0].route_stops?.length;
        this.totalPages = resp.data.pagination?.totalPages
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.getBuseSchedule();
  }

  changePageSize(newPageSize: number) {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.getBuseSchedule();
  }

  viewDetails: any;

  viewMessage(item: any) {
    this.viewDetails = item;
    console.log(this.viewDetails);
  }


}
