import { Component } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-bus-schedule',
  standalone: true,
  imports: [HeaderComponent, CommonModule],
  templateUrl: './all-bus-schedule.component.html',
  styleUrl: './all-bus-schedule.component.css'
})
export class AllBusScheduleComponent {

  data: any;

  constructor(private service: SharedService) { }

  ngOnInit() {

    this.getBuseSchedule();
  }


  getBuseSchedule() {

    this.service.getApi('get-all-busschedule').subscribe({
      next: resp => {
        this.data = resp.data;
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

}
