import { Component, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SharedService } from '../../../services/shared.service';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ErrorMessageService } from '../../../services/error-message.service';
import { LoaderComponent } from '../loader/loader.component';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-bus-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LoaderComponent],
  templateUrl: './bus-list.component.html',
  styleUrl: './bus-list.component.css'
})
export class BusListComponent {

  totalPagesArray: number[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  pageSizeOptions = [5, 10, 25, 50];
  searchQuery: any = '';
  data: any;
  form!: FormGroup;
  editForm!: FormGroup;
  loading: boolean = false;
  @ViewChild('closeModal') closeModal!: ElementRef;
  @ViewChild('closeModal1') closeModal1!: ElementRef;

  constructor(private service: SharedService, private toastr: NzMessageService, private errorMessageService: ErrorMessageService) { }

  ngOnInit() {
    this.getBuses();
    this.initForm();
    this.initUpdateForm();
  }

  initForm() {
    this.form = new FormGroup({
      busName: new FormControl('', Validators.required),
      number: new FormControl('', Validators.required),
      totalSeats: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(0|[1-9]\d*)?$/), // Ensures only digits are allowed
        this.numberRangeValidator(1, 99) // Ensures the number is between 1 and 100
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
        Validators.pattern(/^(0|[1-9]\d*)?$/), // Ensures only digits are allowed
        this.numberRangeValidator(1, 99) // Ensures the number is between 1 and 100
      ]),
      regNum: new FormControl({ value: this.updateDet?.bus_registration_number, disabled: true }, Validators.required)
    })
  }

  numberRangeValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!/^\d+(\.\d{1,2})?$/.test(value)) {
        // If the value is not a valid decimal number, do not perform the range check
        return null;
      }
      const numberValue = parseFloat(value); // Convert the string to a number
      if (numberValue < min || numberValue > max) {
        return { 'numberRange': { value: control.value } };
      }
      return null;
    };
  }

  getBuses() {
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

  btnLoader: boolean = false;

  addBus() {
    this.form.markAllAsTouched();
    const busName = this.form.value.busName?.trim();
    const number = this.form.value.number?.trim();
    //const totalSeats = this.form.value.totalSeats?.trim();
    const regNum = this.form.value.regNum?.trim();

    if (!busName || !number || !regNum) {
      return;
    }

    if (this.form.valid) {
      this.loading = true;
      this.btnLoader = true;
      const formURlData = new URLSearchParams();
      formURlData.set('bus_name', this.form.value.busName);
      formURlData.set('bus_number_plate', this.form.value.number);
      formURlData.set('number_of_seats', this.form.value.totalSeats);
      formURlData.set('bus_registration_number', this.form.value.regNum);

      this.service.postAPI('create-bus', formURlData.toString()).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.btnLoader = false;
            this.loading = false;
            this.closeModal.nativeElement.click();
            this.getBuses();
            this.form.reset();
          } else {
            this.toastr.warning(resp.message, { nzDuration: 160000 });
            this.btnLoader = false;
            this.loading = false;
            this.getBuses();
          }
        },
        error: (error) => {
          this.btnLoader = false;
          this.loading = false;
          if (error.error.message) {
            this.toastr.error(error.error.message, { nzDuration: 160000 });
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
    this.updateDet = details;
    this.updateId = details.bus_id;
    this.initUpdateForm();
  }

  btnEditLoader: boolean = false;

  editBus() {
    this.editForm.markAllAsTouched();

    const busName = this.editForm.value.busName?.trim();
    const number = this.editForm.value.number?.trim();
    //const totalSeats = this.editForm.value.totalSeats?.trim();
    //const regNum = this.editForm.value.regNum?.trim();

    if (!busName || !number) {
      return;
    }

    if (this.editForm.valid) {
      this.btnEditLoader = true;
      this.loading = true;
      const formURlData = new URLSearchParams();
      formURlData.set('bus_name', this.editForm.value.busName);
      formURlData.set('bus_number_plate', this.editForm.value.number);
      formURlData.set('number_of_seats', this.editForm.value.totalSeats);
      formURlData.set('bus_registration_number', this.updateDet?.bus_registration_number);
      formURlData.set('bus_id', this.updateId);

      this.service.postAPI('update-bus', formURlData.toString()).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.btnEditLoader = false;
            this.loading = false;
            this.closeModal1.nativeElement.click();
            this.getBuses();
          } else {
            this.toastr.warning(resp.message);
            this.btnEditLoader = false;
            this.loading = false;
            this.getBuses();
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
    formURlData.set('bus_id', this.updateId);
    this.btnDelLoader = true;
    this.service.postAPI(`delete-bus`, formURlData.toString()).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.closeModal2.nativeElement.click();
          this.getBuses();
          this.toastr.success(resp.message);
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

  getEditErrorMessage(controlName: any): string {
    let control: any = this.editForm.get(controlName);
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

  validateMaxLength(event: Event, length: number): void {
    const input = event.target as HTMLInputElement;
    if (input.value.length > length) {
      input.value = input.value.slice(0, length); // Trim value to the first 3 characters
      //this.total_running_hours = input.value; // Update the model value
    }
  }


  confirmationMessage: string = '';
  selectedBus: any;

  onToggleBusStatus(bus: any) {
    this.selectedBus = bus;
    this.confirmationMessage = bus.is_active == true
      ? 'You want to deactivate this bus!'
      : 'You want to activate this bus!';
  }

  @ViewChild('closeModal3') closeModal3!: ElementRef;

  confirmChange() {
    const formURlData = new URLSearchParams();
    formURlData.set('bus_id', this.selectedBus.bus_id); // Assuming `id` is the bus identifier
    formURlData.set('is_active', this.selectedBus.is_active ? 'false' : 'true'); // Toggle active status

    this.service.postAPI('update-bus-status', formURlData).subscribe({
      next: (res: any) => {
        if (res.success) { // Assuming the API response has a `success` field
          this.toastr.success('Bus status updated successfully!');
          // Update the local data state
          this.selectedBus.is_active = !this.selectedBus.is_active; // Toggle `is_active`
          this.getBuses(); // Refresh the bus list
          this.closeModal3.nativeElement.click();
        } else {
          this.toastr.warning(res.message || 'Unable to update bus status.'); // Handle API warnings
        }
      },
      error: (err) => {
        this.toastr.error('Failed to update bus status.');
      }
    });
  }


}
