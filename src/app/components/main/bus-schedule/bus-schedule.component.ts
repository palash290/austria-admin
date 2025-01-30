import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { SharedService } from '../../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorMessageService } from '../../../services/error-message.service';
import { ActivatedRoute } from '@angular/router';
import { LoaderComponent } from '../loader/loader.component';
import { CategoryManagementComponent } from '../category-management/category-management.component';

@Component({
  selector: 'app-bus-schedule',
  standalone: true,
  imports: [HeaderComponent, CategoryManagementComponent, CommonModule, ReactiveFormsModule, FormsModule, LoaderComponent],
  templateUrl: './bus-schedule.component.html',
  styleUrl: './bus-schedule.component.css'
})
export class BusScheduleComponent {


  loading: boolean = false;
  route_id: any;
  form!: FormGroup;
  daysOfWeek: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  status: boolean = true;
  routeList: any;
  busList: any;
  allDrivers: any;


  constructor(private service: SharedService, private toastr: ToastrService, private activRout: ActivatedRoute, private fb: FormBuilder, private errorMessageService: ErrorMessageService) { }

  ngOnInit() {
    this.activRout.queryParams.subscribe({
      next: (params) => {
        this.route_id = params['route_id'];
      }
    });
    this.addRouteById();
    this.getRoutes();
    this.getBuses();
    this.getDrivers();
    this.initForm();
    // Listen to changes in 'status' to toggle required validators for 'fromDate' and 'toDate'
    this.form.get('status')?.valueChanges.subscribe((statusValue) => {
      this.toggleDateValidators(statusValue);
    });
    this.dateValidation();
  }

  initForm() {
    const controls: any = {};
    // Create form controls for each day
    this.daysOfWeek.forEach(day => {
      controls[day] = new FormControl(false);
    });

    this.form = this.fb.group({
      line: ['', Validators.required],
      busName: ['', Validators.required],
      driver: ['', Validators.required],
      status: [true],
      fromDate: [''],
      toDate: [''],
      recurrence_pattern: new FormControl('Daily'),
      ...controls,
    });
    // Initialize validators based on default 'status' value
    this.toggleDateValidators(this.form.get('status')?.value);
  }

  minDate: any;

  dateValidation() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Ensure two-digit month
    const day = today.getDate().toString().padStart(2, '0'); // Ensure two-digit day
    this.minDate = `${year}-${month}-${day}`; // Format as YYYY-MM-DD
  }

  minDateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value) {
      const inputDate = new Date(control.value);
      const today = new Date(this.minDate);

      if (inputDate < today) {
        return { minDate: true }; // Error key if date is invalid
      }
    }
    return null; // Valid date
  }

  toggleDateValidators(isStatusTrue: boolean): void {
    const fromDateControl = this.form.get('fromDate');
    const toDateControl = this.form.get('toDate');

    if (!isStatusTrue) {
      fromDateControl?.setValidators([Validators.required, this.minDateValidator.bind(this)]);
      toDateControl?.setValidators([Validators.required, this.minDateValidator.bind(this)]);
    } else {
      fromDateControl?.clearValidators();
      toDateControl?.clearValidators();
    }

    fromDateControl?.updateValueAndValidity();
    toDateControl?.updateValueAndValidity();
  }

  dateGreaterOrEqualValidator(fromControlName: string) {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const fromDateValue = this.form?.get(fromControlName)?.value;
      const toDateValue = control.value;

      if (fromDateValue && toDateValue) {
        const fromDate = new Date(fromDateValue);
        const toDate = new Date(toDateValue);

        if (toDate < fromDate) {
          return { dateGreaterOrEqual: true }; // Error key if the to_date is less than from_date
        }
      }
      return null; // Valid date
    };
  }

  getRoutes() {
    this.service.getApi(`get-all-active-routes`).subscribe({
      next: resp => {
        this.routeList = resp.data;
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  getBuses() {
    this.service.getApi(`get-all-buses-by-limit-search`).subscribe({
      next: resp => {
        this.busList = resp.data.buses;
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  getDrivers() {
    this.service.getApi(`get-all-drivers-by-limit-search`).subscribe({
      next: resp => {
        this.allDrivers = resp.data.drivers;
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  lines: any;

  addRouteById(id?: any) {
    if (this.route_id || id) {
      const formURlData = new URLSearchParams();
      formURlData.set('route_id', id ? id : this.route_id);
      this.service.postAPI('get-route-by-id', formURlData.toString()).subscribe({
        next: (response) => {
          if (response.success) {
            this.lines = response.data.route_stops;
            console.log(this.lines);
          } else {
            console.log(response.message);
          }
        },
        error: (error) => {
          if (error.error.message) {
            console.log(error.error.message);
          } else {
            console.log('Something went wrong!');
          }
        }
      });
    }
  }

  updateDepartureTime(index: any): void {
    //debugger
    if (index === 0 || index === this.lines.length - 1) {
      // Do nothing for the first and last row.
      return;
    }

    const stop = this.lines[index];
    //stop.stop_time = '00:00';
    // Ensure both arrival time and stop time are valid.
    //debugger
    // if (stop.stop_time == "00:00:00") {
    //   stop.stop_time = 0;
    // }

    if (stop.arrival_time && stop.stop_time !== null) {

      // Convert arrival time to a Date object.
      const [hours, minutes] = stop.arrival_time.split(':').map(Number);
      const arrivalDate = new Date();
      arrivalDate.setHours(hours, minutes, 0);

      // Add stop time to arrival time.
      const departureDate = new Date(arrivalDate);
      departureDate.setMinutes(arrivalDate.getMinutes() + stop.stop_time);

      // Format the departure time back to HH:mm format.
      const formattedDepartureTime = departureDate
        .toTimeString()
        .split(':')
        .slice(0, 2)
        .join(':');

      // Update the departure time.
      stop.departure_time = formattedDepartureTime;
    } else {
      stop.departure_time = null; // Reset departure time if input is invalid.
    }
  }

  selectedLineId: any = '';
  selectedDriverId: any = '';
  selectedBusId: any = '';
  selectedBusName: any;

  onLineChange(event: any): void {
    const selectedId = event.target.value;
    //const selectedCategory = this.routeList.find((language: any) => language.route_id == selectedId);

    // if (selectedCategory) {
    this.selectedLineId = selectedId;
    //this.selectedBusName = selectedCategory.bus_name;
    console.log('Selected austriaCityId ID:', this.selectedLineId);
    //console.log('Selected austriaCity name:', this.selectedBusName);
    this.addRouteById(selectedId);
    //}
  }


  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      console.log('Form Data:', this.form.value);
    }
  }

  onCancel(): void {
    this.form.reset();
  }



  updatedTickets: any[] = []; // Array to track updated ticket prices

  updateTicketPrice(stop: any, index: any, newValue: any) {

    this.updateDepartureTime(index)
    //debugger

    // Update the `updatedTickets` array for the corresponding `stop_id`
    const ticketIndex = this.updatedTickets.findIndex(ticket => ticket.stop_id == stop.stop_id);
    if (ticketIndex > -1) {
      this.updatedTickets[ticketIndex].departure_time = stop.departure_time;
      this.updatedTickets[ticketIndex].stop_time = stop.stop_time;
      //this.updatedTickets[ticketIndex].departure_time = stop.departure_time;
    } else {
      this.updatedTickets.push({
        stop_id: stop.stop_id,
        arrival_time: stop.arrival_time,
        stop_time: stop.stop_time,
        departure_time: stop.departure_time,
      });
    }
    console.log('updatedTickets:', this.updatedTickets);


  }

  saveUpdatedTicketPrices() {
    if (this.updatedTickets.length > 0) {
      this.service.postData('update-departuretime', this.updatedTickets).subscribe(
        response => {
          console.log('Ticket data successfully updated', response);
          this.toastr.success('Tickets updated successfully!');
          this.updatedTickets = []; // Clear the updated tickets array
        },
        error => {
          console.error('Error updating ticket data', error);
          this.toastr.error('Error updating ticket data');
        }
      );
    } else {
      this.toastr.warning('No updates to save');
    }
  }

  addBus() {
    // this.form.markAllAsTouched();
    // const busName = this.form.value.busName?.trim();
    // const number = this.form.value.number?.trim();
    // //const totalSeats = this.form.value.totalSeats?.trim();
    // const regNum = this.form.value.regNum?.trim();

    // if (!busName || !number || !regNum) {
    //   return;
    // }

    //if (this.form.valid) {
    this.loading = true;
    const formURlData = new URLSearchParams();
    formURlData.set('bus_name', this.form.value.busName);
    formURlData.set('bus_number_plate', this.form.value.number);
    formURlData.set('number_of_seats', this.form.value.totalSeats);
    formURlData.set('bus_registration_number', this.form.value.regNum);

    this.service.postAPI('create-bus', formURlData.toString()).subscribe({
      next: (resp) => {
        if (resp.success == true) {
          this.toastr.success(resp.message);
          this.loading = false;
          //this.form.reset();
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
    //}
  }

  // getRouteById(id: number) {
  //   const formData = new URLSearchParams();
  //   formData.append('route_id', id.toString());
  //   this.service.postAPI('get-route-by-id', formData).subscribe({
  //     next: resp => {
  //       this.form.patchValue({
  //         route: item.route.route_id,
  //         from_date: item.from_date,
  //         to_date: item.to_date,
  //         closure_reason: item.closure_reason
  //       });
  //     },
  //     error: error => {
  //       if (error.error.message) {
  //         this.toastr.error(error.error.message);
  //       } else {
  //         this.toastr.error('Something went wrong!');
  //       }
  //     }
  //   });
  // }


}
