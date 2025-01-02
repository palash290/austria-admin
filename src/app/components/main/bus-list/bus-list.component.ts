import { Component, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SharedService } from '../../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorMessageService } from '../../../services/error-message.service';

@Component({
  selector: 'app-bus-list',
  standalone: true,
  imports: [HeaderComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './bus-list.component.html',
  styleUrl: './bus-list.component.css'
})
export class BusListComponent {

  data: any;
  form!: FormGroup;
  editForm!: FormGroup;
  @ViewChild('closeModal') closeModal!: ElementRef;
  @ViewChild('closeModal1') closeModal1!: ElementRef;

  constructor(private service: SharedService, private toastr: ToastrService, private errorMessageService: ErrorMessageService) { }

  ngOnInit() {
    this.getBuses();
    this.initForm();
    this.initUpdateForm();
  }

  initForm() {
    this.form = new FormGroup({
      busName: new FormControl('', Validators.required),
      number: new FormControl('', Validators.required),
      totalSeats: new FormControl('', Validators.required),
      regNum: new FormControl('', Validators.required)
    })
  }

  initUpdateForm() {
    this.editForm = new FormGroup({
      busName: new FormControl(this.updateDet?.bus_name, Validators.required),
      number: new FormControl(this.updateDet?.bus_number, Validators.required),
      totalSeats: new FormControl(this.updateDet?.total_seats, Validators.required),
      regNum: new FormControl({ value: this.updateDet?.registration_number, disabled: true }, Validators.required)
    })
  }

  getBuses() {
    this.service.getApi('get-all-buses').subscribe({
      next: resp => {
        this.data = resp.data;
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
    const totalSeats = this.form.value.totalSeats?.trim();
    const regNum = this.form.value.regNum?.trim();

    if (!busName || !number || !totalSeats || !regNum) {
      return;
    }

    if (this.form.valid) {
      this.btnLoader = true;
      const formURlData = new URLSearchParams();
      formURlData.set('bus_name', this.form.value.busName);
      formURlData.set('bus_number', this.form.value.number);
      formURlData.set('total_seats', this.form.value.totalSeats);
      formURlData.set('registration_number', this.form.value.regNum);

      this.service.postAPI('create-bus', formURlData.toString()).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.btnLoader = false;
            this.closeModal.nativeElement.click();
            this.getBuses();
            this.form.reset();
          } else {
            this.toastr.warning(resp.message);
            this.btnLoader = false;
            this.getBuses();
          }
        },
        error: (error) => {
          this.btnLoader = false;
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
      const formURlData = new URLSearchParams();
      formURlData.set('bus_name', this.editForm.value.busName);
      formURlData.set('bus_number', this.editForm.value.number);
      formURlData.set('total_seats', this.editForm.value.totalSeats);
      formURlData.set('bus_id', this.updateId);

      this.service.postAPI('update-bus', formURlData.toString()).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.btnEditLoader = false;
            this.closeModal1.nativeElement.click();
            this.getBuses();
          } else {
            this.toastr.warning(resp.message);
            this.btnEditLoader = false;
            this.getBuses();
          }
        },
        error: (error) => {
          this.btnEditLoader = false;
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


}
