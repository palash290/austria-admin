import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './transaction-history.component.html',
  styleUrl: './transaction-history.component.css'
})
export class TransactionHistoryComponent {

  totalPagesArray: number[] = [];
    currentPage: number = 1;
    pageSize: number = 5;
    totalPages: number = 1;
    pageSizeOptions = [5, 10, 25, 50];
    searchQuery: any = '';
    filterQuery: any = '';
    data: any;
  
    constructor(private service: SharedService) { }
  
    ngOnInit() {
      this.getTranx();
    }
  
    getTranx() {
      // this.service.getApi(`user-list?page=${this.currentPage}&limit=${this.pageSize}&search=${this.searchQuery}&filter=${this.filterQuery}`).subscribe({
        this.service.getApi(`get-ticket-booking-transaction?page=${this.currentPage}&limit=${this.pageSize}&search=${this.searchQuery}`).subscribe({
        next: resp => {
          this.data = resp.data.data;
          this.totalPages = resp.data.pagination?.totalPages;
        },
        error: error => {
          console.log(error.message);
        }
      });
    }
  
    changePage(page: number) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      this.getTranx();
    }
  
    changePageSize(newPageSize: number) {
      this.pageSize = newPageSize;
      this.currentPage = 1;
      this.getTranx();
    }
  

}
