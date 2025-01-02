import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ErrorMessageService } from '../../../services/error-message.service';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-all-users',
  standalone: true,
  imports: [HeaderComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './all-users.component.html',
  styleUrl: './all-users.component.css'
})
export class AllUsersComponent {

    data: any;
  
    constructor(private service: SharedService, private toastr: ToastrService, private errorMessageService: ErrorMessageService) { }

    ngOnInit() {
      this.getUsers();
    }

    getUsers() {
      this.service.getApi('user-list').subscribe({
        next: resp => {
          this.data = resp.data;
        },
        error: error => {
          console.log(error.message);
        }
      });
    }


}
