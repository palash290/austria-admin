import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../services/shared.service';
import { ErrorMessageService } from '../../../services/error-message.service';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [HeaderComponent, CommonModule, ReactiveFormsModule, FormsModule, LoaderComponent],
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.css'
})
export class CategoryManagementComponent {

  totalPagesArray: number[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  pageSizeOptions = [5, 10, 25, 50];
  searchQuery: any = '';
  data: any;
  form!: FormGroup;
  loading: boolean = false;
  @ViewChild('closeModal') closeModal!: ElementRef;
  @ViewChild('closeModal1') closeModal1!: ElementRef;

  constructor(private service: SharedService, private toastr: ToastrService, private errorMessageService: ErrorMessageService) { }

  ngOnInit() {
    this.getBuses();
    this.initForm();
  }

  initForm() {
    this.form = new FormGroup({
      busName: new FormControl('', Validators.required),
    })
  }

  getBuses() {
    this.service.getApi(`get-all-ticket-type-search-limit?page=${this.currentPage}&limit=${this.pageSize}&search=${this.searchQuery}`).subscribe({
      next: resp => {
        this.data = resp.data.ticketTypes;
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  btnLoader: boolean = false;

  addBus() {
    this.form.markAllAsTouched();
    // const busName = this.form.value.busName?.trim();

    const busName = this.form.value.busName?.trim();
    this.form.patchValue({ busName });

    if (!busName) {
      return;
    }

    if (this.form.valid) {
      this.btnLoader = true;
      this.loading = true;
      const formURlData = new URLSearchParams();
      formURlData.set('ticket_type', this.form.value.busName);

      this.service.postAPI('create-ticket-type', formURlData.toString()).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.btnLoader = false;
            this.closeModal.nativeElement.click();
            this.getBuses();
            this.form.reset();
            this.loading = false;
          } else {
            this.toastr.warning(resp.message);
            this.btnLoader = false;
            this.loading = false;
            this.getBuses();
          }
        },
        error: (error) => {
          this.btnLoader = false;
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

  updateId: any;

  patchUpdate(details: any) {
    this.updateId = details.ticket_type_id;
  }

  @ViewChild('closeModal2') closeModal2!: ElementRef;

  btnDelLoader: boolean = false;

  deleteMember() {
    const formURlData = new URLSearchParams();
    formURlData.set('ticket_type_id', this.updateId);
    this.btnDelLoader = true;
    this.service.postAPI(`delete-ticket-type`, formURlData.toString()).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.closeModal2.nativeElement.click();
          this.getBuses();
          this.toastr.success(resp.message)
          this.btnDelLoader = false;
        } else {
          this.btnDelLoader = false;
          this.toastr.warning('Something went wrong!');
          this.getBuses();
        }
      },
    });
  }

  getErrorMessage(controlName: any): string {
    let control: any = this.form.get(controlName);
    return this.errorMessageService.getErrorMessage(control)
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.getBuses();
  }

  changePageSize(newPageSize: number) {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.getBuses();
  }


}
