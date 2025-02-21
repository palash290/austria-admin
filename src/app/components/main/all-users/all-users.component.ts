import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-all-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './all-users.component.html',
  styleUrl: './all-users.component.css'
})
export class AllUsersComponent {

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
    this.getUsers();
  }

  getUsers() {
    this.service.getApi(`user-list?page=${this.currentPage}&limit=${this.pageSize}&search=${this.searchQuery}&filter=${this.filterQuery}`).subscribe({
      next: resp => {
        this.data = resp.data.users;
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
    this.getUsers();
  }

  changePageSize(newPageSize: number) {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.getUsers();
  }

  
}
