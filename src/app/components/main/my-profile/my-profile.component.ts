import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent {

  profileForm!: FormGroup;
  userDet: any;
  userEmail: any;
  name: any;
  phone: any;
  loading: boolean = false;

  pattern1 = "^[0-9_-]{8,15}";

  constructor(private route: Router, private service: SharedService, private toastr: ToastrService) { }

  ngOnInit() {
    this.initForm();
    this.loadUserProfile();
  }

  initForm() {
    this.profileForm = new FormGroup({
      name: new FormControl('', Validators.required),
      phone: new FormControl('', [Validators.required, Validators.pattern(this.pattern1)]),
      email: new FormControl({ value: this.userEmail, disabled: true }),
    });
  }

  loadUserProfile() {
    this.service.getApi('profile').subscribe({
      next: (resp) => {
        this.userEmail = resp.data.email;
        this.name = resp.data.name;
        this.phone = resp.data.mobile_number;

        this.profileForm.patchValue({
          name: this.name,
          phone: this.phone,
          email: this.userEmail,
        });

      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  onSubmit() {
    // if (this.profileForm.valid) {
    //   this.toastr.warning('Please check all the fields!');
    //   return;
    // }
    this.profileForm.markAllAsTouched();

    if (this.profileForm.valid) {
      this.loading = true;
      const formURlData = new URLSearchParams();
      formURlData.set('name', this.profileForm.value.name);
      formURlData.set('email', this.userEmail);
      formURlData.set('mobile_number', this.profileForm.value.phone);

      this.service.postAPI('profile-update', formURlData.toString()).subscribe({
        next: (resp) => {
          if (resp.success === true) {
            this.toastr.success(resp.message);
            this.loading = false;
            this.service.triggerRefresh();
          } else {
            this.toastr.warning(resp.message);
            this.loading = false;
          }
        },
        error: (error) => {
          this.toastr.warning('Something went wrong.');
          console.log(error.message);
          this.loading = false;
        }
      });
    } else {
      //this.loading = false;
      this.toastr.warning('Please check all the fields!');
    }
  }

}
