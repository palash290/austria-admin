import { Component, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { SharedService } from '../../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorMessageService } from '../../../services/error-message.service';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-out-of-service',
  standalone: true,
  imports: [HeaderComponent, CommonModule, ReactiveFormsModule, FormsModule, LoaderComponent],
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
  Form!: FormGroup;
  editForm!: FormGroup;
  loading: boolean = false;
  @ViewChild('closeModal') closeModal!: ElementRef;
  @ViewChild('closeModal2') closeModal2!: ElementRef;
  @ViewChild('closeModal3') closeModal3!: ElementRef;
  deleteId: any;
  updateId: any;

  constructor(private service: SharedService, private toastr: ToastrService, private errorMessageService: ErrorMessageService) {
    this.inItForm();
    this.inItEditForm();
  }

  ngOnInit() {
    this.getRoutes();
    this.getAllRoutes();
    this.dateValidation();
  }

  inItForm() {
    this.Form = new FormGroup({
      route: new FormControl('', Validators.required),
      from_date: new FormControl('', [Validators.required, this.minDateValidator.bind(this)]),
      to_date: new FormControl({ value: '', disabled: true }, [Validators.required, this.dateGreaterOrEqualValidator('from_date')]),
      closure_reason: new FormControl('', Validators.required),
    })
  }

  inItEditForm() {
    this.editForm = new FormGroup({
      route: new FormControl('', Validators.required),
      from_date: new FormControl('', [Validators.required, this.minDateValidator.bind(this)]),
      to_date: new FormControl('', [Validators.required, this.dateGreaterOrEqualValidator('from_date')]),
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

  onFromDateKeyup(): void {
    console.log('from_date value:', this.Form.get('from_date')?.value); // Log from_date value
    console.log('from_date touched:', this.Form.get('from_date')?.touched); // Log touch state
    if (this.Form.get('from_date')?.value) {
      this.Form.get('to_date')?.enable(); // Enable the to_date field when from_date has a value
      console.log('to_date enabled:', this.Form.get('to_date')?.enabled); // Check if to_date is enabled
    } else {
      this.Form.get('to_date')?.disable(); // Disable the to_date field if from_date is empty
      console.log('to_date disabled:', this.Form.get('to_date')?.disabled); // Check if to_date is disabled
    }
  }

  submit() {
    this.Form.markAllAsTouched();
    const closure_reason = this.Form.value.closure_reason?.trim();

    if (!closure_reason) {
      return;
    }

    if (this.Form.invalid) {
      return
    }
    this.loading = true;
    this.service.postData(`create-closure`, this.Form.value).subscribe({
      next: resp => {
        if (resp.success) {
          this.toastr.success(resp.message);
          this.getRoutes();
          this.closeModal.nativeElement.click();
          this.loading = false;
        } else {
          this.loading = false;
        }
      },
      error: error => {
        this.loading = false;
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
    this.editForm.patchValue({
      route: item.route.route_id,
      from_date: item.from_date,
      to_date: item.to_date,
      closure_reason: item.closure_reason
    });
    //this.inItEditForm();
  }

  update() {
    if (this.Form.invalid) {
      return
    }

    const closure_reason = this.Form.value.closure_reason?.trim();

    if (!closure_reason) {
      return;
    }
    this.loading = true;
    let formData = { ...this.Form.value, closure_id: this.updateId };

    this.service.postData(`update-closure`, formData).subscribe({
      next: resp => {
        if (resp.success) {
          this.toastr.success(resp.message);
          this.getRoutes();
          this.closeModal3.nativeElement.click();
          this.Form.reset();
          this.loading = false;
        } else {
          this.loading = false;
        }
      },
      error: error => {
        this.loading = false;
        console.log(error.message);
      }
    });
  }

  getErrorMessage(controlName: any): string {
    let control: any = this.Form.get(controlName);
    return this.errorMessageService.getErrorMessage(control)
  }

  minDate: any;

  dateValidation() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Ensure two-digit month
    const day = today.getDate().toString().padStart(2, '0'); // Ensure two-digit day
    this.minDate = `${year}-${month}-${day}`; // Format as YYYY-MM-DD
  }

  minDateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value) {
      const inputDate = new Date(control.value);
      const today = new Date(this.minDate);

      if (inputDate < today) {
        return { minDate: true }; // Error key if date is invalid
      }
    }
    return null; // Valid date
  }

  dateGreaterOrEqualValidator(fromControlName: string) {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const fromDateValue = this.Form?.get(fromControlName)?.value;
      const toDateValue = control.value;

      if (fromDateValue && toDateValue) {
        const fromDate = new Date(fromDateValue);
        const toDate = new Date(toDateValue);

        if (toDate < fromDate) {
          return { dateGreaterOrEqual: true }; // Error key if the to_date is less than from_date
        }
      }
      return null; // Valid date
    };
  }

  viewDetails: any;

  viewMessage(item: any) {
    this.viewDetails = item;
    console.log(this.viewDetails);
    
  }

  // hasError(controlName: string, errorName: string): boolean {
  //   const control = this.Form.get(controlName);
  //   return control?.hasError(errorName) && control.touched;
  // }


}
