import { Component } from '@angular/core';

import { SharedService } from '../../../services/shared.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-price-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './price-management.component.html',
  styleUrl: './price-management.component.css'
})
export class PriceManagementComponent {

  lines: any;

  constructor(private service: SharedService, private toastr: NzMessageService, private router: Router) { }

  ngOnInit() {
    this.getRoutes();
  }

  getRoutes() {
    this.service.getApi(`get-all-routes`).subscribe({
      next: resp => {
        this.lines = resp.data;
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  route_id: any = '';
  selectedBusName: any;

  onStopChange(event: any): void {
    const selectedId = event.target.value;
    this.route_id = selectedId;
    console.log('Selected austriaCityId ID:', this.route_id);
    //this.getTicketTypeById(selectedId);
  }


}
