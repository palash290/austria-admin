import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { SharedService } from '../../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorMessageService } from '../../../services/error-message.service';

@Component({
  selector: 'app-bus-schedule',
  standalone: true,
  imports: [HeaderComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './bus-schedule.component.html',
  styleUrl: './bus-schedule.component.css'
})
export class BusScheduleComponent {

  data: any;

    constructor(private service: SharedService, private toastr: ToastrService, private errorMessageService: ErrorMessageService) { }
  
    ngOnInit() {
      this.getBuses();
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
    

}
