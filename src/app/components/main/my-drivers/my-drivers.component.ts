import { Component, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SharedService } from '../../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorMessageService } from '../../../services/error-message.service';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-my-drivers',
  standalone: true,
  imports: [HeaderComponent, CommonModule, ReactiveFormsModule, FormsModule, LoaderComponent],
  templateUrl: './my-drivers.component.html',
  styleUrl: './my-drivers.component.css'
})
export class MyDriversComponent {

  totalPagesArray: number[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  pageSizeOptions = [5, 10, 25, 50];
  searchQuery: any = '';
  data: any;
  form!: FormGroup;
  editForm!: FormGroup;
  @ViewChild('closeModal') closeModal!: ElementRef;
  @ViewChild('closeModal1') closeModal1!: ElementRef;
  pattern1 = "^[0-9_-]{8,15}";
  loading: boolean = false;

  constructor(private service: SharedService, private toastr: ToastrService, private errorMessageService: ErrorMessageService) { }

  ngOnInit() {
    this.getDrivers();
    this.initForm();
    this.initUpdateForm();
  }

  initForm() {
    this.form = new FormGroup({
      driver_name: new FormControl('', Validators.required),
      license_number: new FormControl('', Validators.required),
      contact_number: new FormControl('', [Validators.required, Validators.pattern(this.pattern1)]),
      file: new FormControl(null)
    })
  }

  croppedImage: any | ArrayBuffer | null = null;
  UploadedFile!: File;

  handleCommittedFileInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.UploadedFile = inputElement.files[0];
      this.previewImage(this.UploadedFile);
    }
  }

  previewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.croppedImage = e.target?.result;
    };
    reader.readAsDataURL(file);
  }

  initUpdateForm() {
    this.editForm = new FormGroup({
      driver_name: new FormControl(this.updateDet?.driver_name, Validators.required),
      license_number: new FormControl(this.updateDet?.driver_license_number, Validators.required),
      contact_number: new FormControl(this.updateDet?.driver_contact_number, [Validators.required, Validators.pattern(this.pattern1)]),
      // file: new FormControl({ value: this.updateDet?.registration_number, disabled: true }, Validators.required)
      file: new FormControl(null)
    })
  }

  eventImage: any | ArrayBuffer | null = null;
  UploadedEditFile!: File;

  handleCommittedFileInputEdit(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.UploadedEditFile = inputElement.files[0];
      this.previewImage1(this.UploadedEditFile);
    }
  }

  previewImage1(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.eventImage = e.target?.result;
    };
    reader.readAsDataURL(file);
  }


  getDrivers() {
    this.service.getApi(`get-all-drivers-by-limit-search?page=${this.currentPage}&limit=${this.pageSize}&search=${this.searchQuery}`).subscribe({
      next: resp => {
        this.data = resp.data.drivers;
        this.totalPages = resp.data.pagination?.totalPages
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  btnLoader: boolean = false;

  addDriver() {
    this.form.markAllAsTouched();
    const busName = this.form.value.driver_name?.trim();
    const number = this.form.value.license_number?.trim();
    const totalSeats = this.form.value.contact_number?.trim();
    //const regNum = this.form.value.regNum?.trim();

    if (!busName || !number || !totalSeats) {
      return;
    }

    if (this.form.valid) {
      this.btnLoader = true;
      this.loading = true;
      const formURlData = new FormData();
      formURlData.set('driver_name', this.form.value.driver_name);
      formURlData.set('driver_license_number', this.form.value.license_number);
      formURlData.set('driver_contact_number', this.form.value.contact_number);
      if (this.UploadedFile) {
        formURlData.set('file', this.UploadedFile);
      }

      this.service.postAPIFormData('create-driver', formURlData).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.btnLoader = false;
            this.loading = false;
            this.closeModal.nativeElement.click();
            this.getDrivers();
            this.form.reset();
          } else {
            this.toastr.warning(resp.message);
            this.btnLoader = false;
            this.loading = false;
            this.getDrivers();
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

  updateDet: any;
  updateId: any;

  patchUpdate(details: any) {
    // debugger
    this.updateDet = details;
    this.eventImage = details.driver_profile_picture;
    this.updateId = details.driver_id;
    this.initUpdateForm();
  }

  btnEditLoader: boolean = false;

  editBus() {
    this.editForm.markAllAsTouched();

    const busName = this.editForm.value.driver_name?.trim();
    const number = this.editForm.value.license_number?.trim();
    const totalSeats = this.editForm.value.contact_number?.trim();
    //const regNum = this.editForm.value.regNum?.trim();

    if (!busName || !number || !totalSeats) {
      return;
    }

    if (this.editForm.valid) {
      this.btnEditLoader = true;
      this.loading = true;
      const formURlData = new URLSearchParams();
      formURlData.set('driver_name', this.editForm.value.driver_name);
      formURlData.set('driver_license_number', this.editForm.value.license_number);
      formURlData.set('driver_contact_number', this.editForm.value.contact_number);
      formURlData.set('driver_id', this.updateId);

      this.service.postAPI('update-driver', formURlData.toString()).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.btnEditLoader = false;
            this.loading = false;
            this.closeModal1.nativeElement.click();
            this.getDrivers();
          } else {
            this.toastr.warning(resp.message);
            this.btnEditLoader = false;
            this.loading = false;
            this.getDrivers();
          }
        },
        error: (error) => {
          this.btnEditLoader = false;
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


  @ViewChild('closeModal2') closeModal2!: ElementRef;

  btnDelLoader: boolean = false;

  deleteMember() {
    const formURlData = new URLSearchParams();
    formURlData.set('driver_id', this.updateId);
    this.btnDelLoader = true;
    this.service.postAPI(`delete-driver`, formURlData.toString()).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.closeModal2.nativeElement.click();
          this.getDrivers();
          this.toastr.success(resp.message)
          this.btnDelLoader = false;
        } else {
          this.btnDelLoader = false;
          this.toastr.warning('Something went wrong!');
          this.getDrivers();
        }
      },
    });
  }

  getErrorMessage(controlName: any): string {
    let control: any = this.form.get(controlName);
    return this.errorMessageService.getErrorMessage(control)
  }

  getEditErrorMessage(controlName: any): string {
    let control: any = this.editForm.get(controlName);
    return this.errorMessageService.getErrorMessage(control)
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.getDrivers();
  }

  changePageSize(newPageSize: number) {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.getDrivers();
  }

}
// "driver_id": 1,
// "driver_name": "Rohan singh update",
// "driver_license_number": "123456789532",
// "driver_contact_number": "9849876543",
// "driver_address": null,
// "driver_dob": null,
// "is_active": true,
// "driver_profile_picture": null,
// "driver_rating": 0,
// "license_expiry_date": null,
// "created_at": "2024-12-23T11:40:36.453Z",
// "updated_at": "2024-12-23T11:49:09.000Z"