import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-new-route',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-route.component.html',
  styleUrl: './new-route.component.css'
})
export class NewRouteComponent {
  stopCityID = ''
  status: boolean = false;
  title: string = 'Відень - Львів - Київ';
  description: string = '';
  busStops: any[] = [
    { city_id: '1', isNew: false },
    { city_id: '2', isNew: false }
  ];
  departureTimes: string[] = ['08:00'];
  newDepartureTime: string = '';
  route_id: any;

  constructor(private service: SharedService, private toastr: ToastrService, private activRout: ActivatedRoute) { }

  ngOnInit() {
    this.activRout.queryParams.subscribe({
      next: (params) => {
        this.route_id = params['route_id'];
      }
    })
    this.getAllCity();
  }

  addBusStop() {
    debugger
    this.busStops.push({ city_id: null, isNew: true });
  }

  addDepartureTime() {
    if (this.newDepartureTime) {
      this.departureTimes.push(this.newDepartureTime);
      this.newDepartureTime = '';
    }
  }

  editTime(time: string) {
    // Logic to edit a departure time
  }

  deleteTime(time: string) {
    this.departureTimes = this.departureTimes.filter(t => t !== time);
  }

  cancel() {
    // Logic to cancel and return to the previous page
  }

  deleteBusStop(index: number) {
    this.busStops.splice(index, 1);
  }

  reorderBusStop(currentIndex: number, newIndex: number) {
    if (newIndex >= 0 && newIndex < this.busStops.length) {
      const movedStop = this.busStops.splice(currentIndex, 1)[0];
      this.busStops.splice(newIndex, 0, movedStop);
    }
  }

  allCities: any;

  getAllCity() {
    //debugger
    this.service.getApi('get-all-city').subscribe({
      next: resp => {
        const allCities = resp.data;
        allCities.unshift({
          city_id: null,
          country_name: "select",
          city_name: "--Select--",
          city_address: "",
          latitude: "47.2675322",
          longitude: "11.3910349",
          is_active: true,
          created_at: "2025-01-07T08:07:20.224Z",
          updated_at: "2025-01-07T08:07:20.224Z",
        });

        // Assign the modified array to this.allCities
        this.allCities = allCities;
        console.log(this.allCities);
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  // onChange(event: Event, index: number) {
  //   debugger
  //   const selectedValue = (event.target as HTMLSelectElement).value;
  //   this.busStops[index].city_id = selectedValue;
  // }

  saveBusStops() {
   debugger
    const selectedIds = this.busStops.map((stop) => stop.city_id);
    console.log('Selected Values:', selectedIds);
  }


}
