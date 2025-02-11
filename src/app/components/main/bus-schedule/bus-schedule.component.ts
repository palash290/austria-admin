import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { SharedService } from '../../../services/shared.service';
import { ErrorMessageService } from '../../../services/error-message.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoaderComponent } from '../loader/loader.component';
import { CategoryManagementComponent } from '../category-management/category-management.component';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-bus-schedule',
  standalone: true,
  imports: [CategoryManagementComponent, CommonModule, ReactiveFormsModule, FormsModule, LoaderComponent, RouterLink],
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
  isEdit: any;

  constructor(private service: SharedService, private toastr: NzMessageService, private activRout: ActivatedRoute, private fb: FormBuilder, private router: Router) { }

  ngOnInit() {
    this.activRout.queryParams.subscribe({
      next: (params) => {
        this.route_id = params['route_id'];
        this.isEdit = params['isEdit'];
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
    this.getRouteById(this.route_id);
  }

  initForm() {
    const controls: any = {};
    // Create form controls for each day
    this.daysOfWeek.forEach(day => {
      controls[day] = new FormControl(false);
    });

    this.form = this.fb.group({
      line: [this.route_id, Validators.required],
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
    this.service.getApi(`get-all-buses`).subscribe({
      next: resp => {
        this.busList = resp.data;
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
    //console.log('Selected austriaCityId ID:', this.selectedLineId);
    this.addRouteById(selectedId);
    this.getRouteById(selectedId);
    //}
  }


  // onSubmit(): void {
  //   this.form.markAllAsTouched();

  //   console.log('Form Data:', this.form.value);

  // }

  isDaysOfWeekValid: boolean = true;

  saveBusStops() {
    debugger
    this.form.markAllAsTouched();

    const selectedDays = this.daysOfWeek.filter(day => this.form.value[day]); // Filter selected days

    this.isDaysOfWeekValid = selectedDays.length > 0;

    if (!this.isDaysOfWeekValid) {
      this.toastr.warning('Please select at least one day.');
      return;
    }

    // Determine the value for recurrence_pattern
    const recurrencePattern = selectedDays.length === this.daysOfWeek.length ? 'Daily' : 'Custom';

    if (this.form.valid) {
      const formData = new URLSearchParams();
      formData.append('bus_id', this.form.value.busName);
      formData.append('route_id', this.route_id ? this.route_id : this.form.value.line);
      formData.append('driver_id', this.form.value.driver);
      formData.append('available', this.form.value.status ? 'true' : 'false');
      formData.append('from', this.form.value.status ? '' : this.form.value.fromDate);
      formData.append('to', this.form.value.status ? '' : this.form.value.toDate);

      formData.append('recurrence_pattern', recurrencePattern);
      formData.append(
        'days_of_week',
        this.daysOfWeek
          .filter(day => this.form.value[day]) // Include only selected days
          .join(',')
      );
      // formData.append('recurrence_pattern', this.form.value.busName);
      if (this.schedule_id) {
        formData.append('schedule_id', this.schedule_id);
      }
      // debugger
      let url = this.getBusScheduleData?.length > 0 ? 'update-busschedule' : 'create-busschedule';

      this.service
        .postAPI(url, formData.toString())
        .subscribe({
          next: (res: any) => {
            if (res.success == true) {
              this.toastr.success(res.message);
              this.router.navigate(['/home/routes-management'])
            } else {
              this.toastr.warning(res.message);
            }
          },
          error: error => {
            if (error.error.message) {
              this.toastr.error(error.error.message);
            } else {
              this.toastr.error('Something went wrong!');
            }
          }
        });
    }
  };

  cancel() {
    this.router.navigate(['/home/routes-management'])
  }



  updatedTickets: any[] = []; // Array to track updated ticket prices

  updateTicketPrice(stop: any, index: any, newValue: any) {

    if (parseFloat(newValue) <= 0) {
      this.toastr.error('Please enter valid Stop Time');
    }

    this.updateDepartureTime(index)
    //debugger

    // Update the `updatedTickets` array for the corresponding `stop_id`
    const ticketIndex = this.updatedTickets.findIndex(ticket => ticket.stop_id == stop.stop_id);
    if (ticketIndex > -1) {
      this.updatedTickets[ticketIndex].departure_time = stop.departure_time;
      this.updatedTickets[ticketIndex].stop_time = stop.stop_time ? String(stop.stop_time) : null;
      //this.updatedTickets[ticketIndex].departure_time = stop.departure_time;
    } else {
      this.updatedTickets.push({
        stop_id: stop.stop_id,
        arrival_time: stop.arrival_time,
        stop_time: stop.stop_time ? String(stop.stop_time) : null,
        departure_time: stop.departure_time,
      });
    }
    console.log('updatedTickets:', this.updatedTickets);
  }

  saveUpdatedTicketPrices() {
    if (this.updatedTickets.length > 0) {
      this.service.postData('update-departuretime', this.updatedTickets).subscribe(
        res => {
          // console.log('Ticket data successfully updated', res);
          if (res.success == true) {
            this.toastr.success('Tickets updated successfully!');
            this.updatedTickets = []; // Clear the updated tickets array
            //this.router.navigate(['/home/routes-management'])
          } else {
            this.toastr.warning(res.message);
          }
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

  // addBus() {
  //   this.form.markAllAsTouched();
  //   // const busName = this.form.value.busName?.trim();
  //   // const number = this.form.value.number?.trim();
  //   // //const totalSeats = this.form.value.totalSeats?.trim();
  //   // const regNum = this.form.value.regNum?.trim();

  //   // if (!busName || !number || !regNum) {
  //   //   return;
  //   // }

  //   if (this.form.valid) {
  //   this.loading = true;
  //   const formURlData = new URLSearchParams();
  //   formURlData.set('bus_name', this.form.value.busName);
  //   formURlData.set('bus_number_plate', this.form.value.number);
  //   formURlData.set('number_of_seats', this.form.value.totalSeats);
  //   formURlData.set('bus_registration_number', this.form.value.regNum);

  //   this.service.postAPI('create-bus', formURlData.toString()).subscribe({
  //     next: (resp) => {
  //       if (resp.success == true) {
  //         this.toastr.success(resp.message);
  //         this.loading = false;
  //         //this.form.reset();
  //       } else {
  //         this.toastr.warning(resp.message);
  //         this.loading = false;
  //       }
  //     },
  //     error: (error) => {
  //       this.loading = false;
  //       if (error.error.message) {
  //         this.toastr.error(error.error.message);
  //       } else {
  //         this.toastr.error('Something went wrong!');
  //       }
  //     }
  //   });
  //   }
  // }

  schedule_id: any;
  getBusScheduleData: any;

  getRouteById(route_id: any) {
    if (route_id) {
      const formData = new URLSearchParams();
      formData.append('route_id', route_id);
      this.service.postAPI('get-all-busschedule-by-routeid', formData).subscribe({
        next: resp => {
          if (resp.data?.length > 0) {
            //debugger
            this.getBusScheduleData = resp.data;
            const data = resp?.data[0];
            const daysOfWeekArray = data.days_of_week?.split(','); // Split the string into an array

            // Create an object to patch day controls
            const dayControls: any = {};
            this.daysOfWeek.forEach(day => {
              dayControls[day] = daysOfWeekArray.includes(day); // Set true for selected days
            });
            this.schedule_id = resp.data[0].schedule_id;
            this.form.patchValue({
              line: resp.data[0].route?.route_id,
              busName: resp.data[0].bus?.bus_id,
              driver: resp.data[0].driver?.driver_id,
              status: resp.data[0].available,
              fromDate: resp.data[0].from,
              toDate: resp.data[0].to,
              ...dayControls
            });
          }
        },
        error: error => {
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
