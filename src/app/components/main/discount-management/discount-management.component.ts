import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoaderComponent } from '../loader/loader.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-discount-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LoaderComponent],
  templateUrl: './discount-management.component.html',
  styleUrl: './discount-management.component.css'
})
export class DiscountManagementComponent {

  data: any;
  totalPages: number = 1;
  currentPage: number = 1;
  pageSize: number = 5;
  searchQuery: any = '';
  pageSizeOptions = [5, 10, 25, 50];
  form!: FormGroup;
  editForm!: FormGroup;
  loading: boolean = false;
  @ViewChild('closeModal') closeModal!: ElementRef;
  @ViewChild('closeModal1') closeModal1!: ElementRef;

  constructor(private service: SharedService, private toastr: NzMessageService) { }

  ngOnInit() {
    this.getDiscList();
    this.initForm();
    this.initUpdateForm();
  }

  initForm() {
    this.form = new FormGroup({
      busName: new FormControl('', Validators.required),
      number: new FormControl('', Validators.required),
      totalSeats: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(0|[1-9]\d*)?$/)
      ]),
      regNum: new FormControl('', Validators.required)
    })
  }

  initUpdateForm() {
    this.editForm = new FormGroup({
      busName: new FormControl(this.updateDet?.bus_name, Validators.required),
      number: new FormControl(this.updateDet?.bus_number_plate, Validators.required),
      totalSeats: new FormControl(this.updateDet?.number_of_seats, [
        Validators.required,
        Validators.pattern(/^(0|[1-9]\d*)?$/)
      ]),
      regNum: new FormControl({ value: this.updateDet?.bus_registration_number, disabled: true }, Validators.required)
    })
  }

  getDiscList() {
    this.service.getApi(`get-all-buses-by-limit-search?page=${this.currentPage}&limit=${this.pageSize}&search=${this.searchQuery}`).subscribe({
      next: resp => {
        this.data = resp.data.buses;
        this.totalPages = resp.data.pagination?.totalPages;
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  updateDet: any;
  updateId: any;

  patchUpdate(details: any) {
    this.updateDet = details;
    this.updateId = details.bus_id;
    this.initUpdateForm();
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.getDiscList();
  }

  changePageSize(newPageSize: number) {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.getDiscList();
  }



}
