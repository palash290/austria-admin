import { Component, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { SharedService } from '../../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorMessageService } from '../../../services/error-message.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [HeaderComponent, FormsModule, CommonModule, LoaderComponent],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent {
  totalPagesArray: number[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  pageSizeOptions = [5, 10, 25, 50];
  searchQuery: any = '';
  data: any;
  currentMsg: any;
  replyMsg: string = '';
  loading: boolean = false;
  @ViewChild('closeModal') closeModal!: ElementRef;

  constructor(private service: SharedService, private toastr: ToastrService, private errorMessageService: ErrorMessageService) { }

  ngOnInit() {
    this.getContacts();
  }

  getContacts() {
    this.service.getApi(`contact-us-search-with-limit?page=${this.currentPage}&limit=${this.pageSize}&search=${this.searchQuery}`).subscribe({
      next: resp => {
        this.data = resp.data.contactUs;
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
    this.getContacts();
  }

  changePageSize(newPageSize: number) {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.getContacts();
  }

  reply(item: any) {
    this.currentMsg = item
  }

  viewMessage(item: any) {
    this.currentMsg = item
  }

  send() {
    const replyMsg = this.replyMsg?.trim();

    if (!replyMsg) {
      return;
    }
    this.loading = true;
    let formData = new URLSearchParams();

    formData.set('contact_id', this.currentMsg.contact_id)
    formData.set('email', this.currentMsg.email)
    formData.set('query', this.currentMsg.query)
    formData.set('response', this.replyMsg)
    formData.set('name', this.currentMsg.name)

    this.service.postAPI('customer-query-responded', formData.toString()).subscribe({
      next: (response) => {
        if (response.success) {
          //this.letLongUkrane = response.data;
          this.closeModal.nativeElement.click();
          this.toastr.success(response.message);
          this.getContacts();
          this.replyMsg = '';
          this.loading = false;
        } else {
          this.loading = false;
          this.toastr.warning(response.message);
        }
      },
      error: (error) => {
        this.loading = false;
        if (error.error.message) {
          this.toastr.error(error.error.message);
        } else {
          this.toastr.error('Something went wrong!');
        }
      }
    });
  }

  
}
