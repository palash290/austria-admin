import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoaderComponent } from '../loader/loader.component';
import { SharedService } from '../../../services/shared.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ErrorMessageService } from '../../../services/error-message.service';

@Component({
  selector: 'app-currency-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LoaderComponent],
  templateUrl: './currency-management.component.html',
  styleUrl: './currency-management.component.css'
})
export class CurrencyManagementComponent {

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
      this.initUpdateForm();
    }
  
    initUpdateForm() {
      this.editForm = new FormGroup({
        from_currency: new FormControl({ value: this.updateDet?.from_currency, disabled: true }, Validators.required),
        to_currency: new FormControl({ value: this.updateDet?.to_currency, disabled: true }, Validators.required),
        rate: new FormControl(this.updateDet?.rate, [
          Validators.required,
          Validators.min(0)
        ]),
      });
    }
  
    getBuses() {
      this.service.getApi(`get-currency-exchange`).subscribe({
        next: resp => {
          this.data = resp.data;
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
      this.updateId = details.id;
      this.initUpdateForm();
    }
  
    btnEditLoader: boolean = false;
  
    editBus() {
      this.editForm.markAllAsTouched();
  
      const rate = this.editForm.value.rate?.trim();
  
      if (!rate) {
        return;
      }
  
      if (this.editForm.valid) {
        this.btnEditLoader = true;
        this.loading = true;
        const formURlData = new URLSearchParams();
        formURlData.set('from_currency', this.editForm.value.from_currency);
        formURlData.set('to_currency', this.editForm.value.to_currency);
        formURlData.set('rate', this.editForm.value.rate);
        formURlData.set('id', this.updateId);
  
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


}
