import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ErrorMessageService } from '../../../services/error-message.service';
import { LoaderComponent } from '../../main/loader/loader.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoaderComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  isPasswordVisible: boolean = false;
  loginForm!: FormGroup;
  loading: boolean = false;

  constructor(private route: Router, private apiService: SharedService, private toastr: ToastrService, private errorMessageService: ErrorMessageService) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
    })
  }

  loginAndFetchData() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      this.loading = true;
      const formURlData = new URLSearchParams();
      formURlData.set('email', this.loginForm.value.email);
      formURlData.set('password', this.loginForm.value.password);
      this.apiService.postAPI('login', formURlData.toString()).subscribe({
        next: (resp: any) => {
          if (resp.success == true) {
            this.route.navigateByUrl("/home/dashboard");
            this.apiService.setToken(resp.data);
            this.toastr.success(resp.message);
            this.loading = false;
          } else {
            this.toastr.warning(resp.message);
            this.loading = false;
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

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  getErrorMessage(controlName: any): string {
    let control: any = this.loginForm.get(controlName);
    return this.errorMessageService.getErrorMessage(control)
  }


}
