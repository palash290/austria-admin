import { Component, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { SharedService } from '../../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorMessageService } from '../../../services/error-message.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-out-of-service',
  standalone: true,
  imports: [HeaderComponent, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './out-of-service.component.html',
  styleUrl: './out-of-service.component.css'
})
export class OutOfServiceComponent {
  totalPagesArray: number[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  pageSizeOptions = [5, 10, 25, 50];
  searchQuery: any = '';
  data: any;
  routes: any;
  Form!: FormGroup
  @ViewChild('closeModal') closeModal!: ElementRef;
  @ViewChild('closeModal2') closeModal2!: ElementRef;
  @ViewChild('closeModal3') closeModal3!: ElementRef;
  deleteId: any;
  updateId: any;

  constructor(private service: SharedService, private toastr: ToastrService, private errorMessageService: ErrorMessageService) {
    this.inItForm()
  }

  ngOnInit() {
    this.getRoutes();
    this.getAllRoutes()
  }

  inItForm() {
    this.Form = new FormGroup({
      route: new FormControl('', Validators.required),
      from_date: new FormControl('', Validators.required),
      to_date: new FormControl('', Validators.required),
      closure_reason: new FormControl('', Validators.required),
    })
  }

  getRoutes() {
    this.service.getApi(`get-all-closures-by-limit-search?page=${this.currentPage}&limit=${this.pageSize}`).subscribe({
      next: resp => {
        this.data = resp.data.routeClosures;
        this.totalPages = resp.data.pagination?.totalPages
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  getAllRoutes() {
    this.service.getApi(`get-all-routes`).subscribe({
      next: resp => {
        this.routes = resp.data;
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.getRoutes();
  }

  changePageSize(newPageSize: number) {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.getRoutes();
  }

  submit() {
    if (this.Form.invalid) {
      return
    }
    this.service.postData(`create-closure`, this.Form.value).subscribe({
      next: resp => {
        if (resp.success) {
          this.toastr.success(resp.message)
          this.getRoutes()
          this.closeModal.nativeElement.click()
        }
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  DeletePopUp(id: any) {
    this.deleteId = id
  }

  deleteData() {
    let formData = {
      closure_id: this.deleteId
    }

    this.service.postData(`delete-closure`, formData).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.closeModal2.nativeElement.click();
          this.getRoutes();
          this.toastr.success(resp.message)
        } else {
          this.toastr.warning('Something went wrong!');
          this.getRoutes();
        }
      },
    });
  }

  patchData(item: any) {
    this.updateId = item.closure_id
    this.Form.patchValue({
      route: item.route.route_id,
      from_date: item.from_date,
      to_date: item.to_date,
      closure_reason: item.closure_reason
    })
  }

  update() {
    if (this.Form.invalid) {
      return
    }
    let formData = { ...this.Form.value, closure_id: this.updateId };

    this.service.postData(`update-closure`, formData).subscribe({
      next: resp => {
        if (resp.success) {
          this.toastr.success(resp.message)
          this.getRoutes()
          this.closeModal3.nativeElement.click()
          this.Form.reset()
        }
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  getErrorMessage(controlName: any): string {
    let control: any = this.Form.get(controlName);
    return this.errorMessageService.getErrorMessage(control)
  }
}
