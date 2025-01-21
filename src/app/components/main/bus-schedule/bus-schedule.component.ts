import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { SharedService } from '../../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorMessageService } from '../../../services/error-message.service';
import { ActivatedRoute } from '@angular/router';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-bus-schedule',
  standalone: true,
  imports: [HeaderComponent, CommonModule, ReactiveFormsModule, FormsModule, LoaderComponent],
  templateUrl: './bus-schedule.component.html',
  styleUrl: './bus-schedule.component.css'
})
export class BusScheduleComponent {

  data: any;
  routeId: any;
  pickupId: any;
  dropoffId: any;
  adultPrice: any;
  childPrice: any;
  extraPrice: any;
  selectedRecurrence: any = 'Daily';
  weekDays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  selectedDays: string[] = [];
  loading: boolean = false;

  dropdownOpen: boolean = false;
  selectedOptions: { [key: string]: boolean } = {};

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  getSelectedOptions(): string {
    const selected = Object.keys(this.selectedOptions).filter(
      (key) => this.selectedOptions[key]
    );
    return selected.length > 0 ? selected.join(', ') : '';
  }

  constructor(private service: SharedService, private toastr: ToastrService, private actRoute: ActivatedRoute) { }

  ngOnInit() {
    this.actRoute.params.subscribe(params => {
      const id = params['routeId'];
      const pickupId = params['pickupId'];
      const dropoffId = params['dropoffId'];
      this.routeId = id;
      this.pickupId = pickupId;
      this.dropoffId = dropoffId;
    });
    this.getBuseSchedule();
    this.getBuses();
    this.getDrivers();
    this.getPickupTerminalsByCity();
    this.getDropoffTerminalsByCity();
    this.fetchCategories();
  }

  categories: { ticket_type: string, price?: string }[] = [];

  fetchCategories() {
    this.service.getApi('get-all-ticket-type')
      .subscribe(response => {
        this.categories = response.data.map((category: any) => ({
          ...category,
          price: '' // Initialize with an empty string
        }));
      });
  }


  getBuseSchedule() {
    const formURlData = new URLSearchParams();
    formURlData.set('route_id', this.routeId);
    this.service.postAPI('get-all-busschedule-by-routeid', formURlData.toString()).subscribe({
      next: resp => {
        this.data = resp.data;
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  allBuses: any;
  allDrivers: any;

  getBuses() {
    this.service.getApi('get-all-buses').subscribe({
      next: resp => {
        this.allBuses = resp.data;
        this.selectedBusId = this.allBuses[0].bus_id;
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  getDrivers() {
    this.service.getApi('get-all-drivers').subscribe({
      next: resp => {
        this.allDrivers = resp.data;
        this.selectedDriverId = this.allDrivers[0].driver_id;
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  selectedBusId: any = '';
  selectedBusName: any;

  onBusChange(event: any): void {
    const selectedId = event.target.value;
    const selectedCategory = this.allBuses.find((language: any) => language.bus_id == selectedId);

    if (selectedCategory) {
      this.selectedBusId = selectedId;
      this.selectedBusName = selectedCategory.bus_name;
      console.log('Selected austriaCityId ID:', this.selectedBusId);
      console.log('Selected austriaCity name:', this.selectedBusName);
    }
  }

  selectedDriverId: any = '';
  selectedDriverName: any;

  onDriverChange(event: any): void {
    const selectedId = event.target.value;
    const selectedCategory = this.allDrivers.find((language: any) => language.driver_id == selectedId);

    if (selectedCategory) {
      this.selectedDriverId = selectedId;
      this.selectedDriverName = selectedCategory.driver_name;
      console.log('Selected austriaCityId ID:', this.selectedDriverId);
      console.log('Selected austriaCity name:', this.selectedDriverName);
      console.log(this.departure_time);

    }
  }


  selectedPickupTerminalId: any = '';
  selectedPickupTerminalName: any;

  onPickupTerminalChange(event: any): void {
    const selectedId = event.target.value;
    const selectedCategory = this.pickupTerminals.find((language: any) => language.terminal_id == selectedId);

    if (selectedCategory) {
      this.selectedPickupTerminalId = selectedId;
      this.selectedPickupTerminalName = selectedCategory.terminal_name;
      console.log('Selected austriaCityId ID:', this.selectedPickupTerminalId);
      console.log('Selected austriaCity name:', this.selectedPickupTerminalName);
    }
  }


  selectedDropTerminalId: any = '';
  selectedDropTerminalName: any;

  onDropTerminalChange(event: any): void {
    const selectedId = event.target.value;
    const selectedCategory = this.dropoffTerminals.find((language: any) => language.terminal_id == selectedId);

    if (selectedCategory) {
      this.selectedDropTerminalId = selectedId;
      this.selectedDropTerminalName = selectedCategory.terminal_name;
      console.log('Selected austriaCityId ID:', this.selectedDropTerminalId);
      console.log('Selected austriaCity name:', this.selectedDropTerminalName);

    }
  }

  @ViewChild('closeModal') closeModal!: ElementRef;
  departure_time: any;
  total_running_hours: any;

  // Method to format data into the desired array
  getPricesData(): any[] {
    // return [
    //   { category: 'Adult', price: this.adultPrice },
    //   { category: 'Child', price: this.childPrice },
    //   { category: 'Extra', price: this.extraPrice }
    // ];

    return this.categories.map(category => ({
      category: category.ticket_type,
      price: category.price || null
    }));
  }

  addTerminal() {
    // const busName = this.total_running_hours?.trim();

    // if (!busName) {
    //   return;
    // }
    this.loading = true;
    const formattedData = JSON.stringify(this.getPricesData());
    const formURlData = new URLSearchParams();
    formURlData.set('bus_id', this.selectedBusId);
    formURlData.set('route_id', this.routeId);
    formURlData.set('driver_id', this.selectedDriverId);
    formURlData.set('departure_time', this.departure_time);
    formURlData.set('total_running_hours', this.total_running_hours);
    formURlData.set('recurrence_pattern', this.selectedRecurrence);

    const selected: any = Object.keys(this.selectedOptions).filter(
      (key) => this.selectedOptions[key]
    );

    if (this.selectedRecurrence == 'Custom') {
      if (selected?.length > 0) {
        formURlData.set('days_of_week', selected);
      } else {
        this.toastr.error('Please select days of week for custom recurrence');
        return
      }
    } else {
      const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      formURlData.set('days_of_week', allDays.join(','));
    }

    formURlData.set('base_pricing', formattedData);

    this.service.postAPI('create-busschedule', formURlData.toString()).subscribe({
      next: (response) => {
        if (response.success) {
          //this.letLongUkrane = response.data;
          this.closeModal.nativeElement.click();
          this.toastr.success(response.message);
          this.getBuseSchedule();
          this.selectedOptions = {};
          this.selectedRecurrence = 'Daily';
          this.total_running_hours = '';
          this.departure_time = '';
          this.adultPrice = '';
          this.childPrice = '';
          this.extraPrice = '';
          this.loading = false;
        } else {
          this.toastr.warning(response.message);
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

  validateMaxLength(event: Event, length: number): void {
    const input = event.target as HTMLInputElement;
    if (input.value.length > length) {
      input.value = input.value.slice(0, length); // Trim value to the first 3 characters
      //this.total_running_hours = input.value; // Update the model value
    }
  }


  pickupTerminals: any;

  getPickupTerminalsByCity() {
    const formURlData = new URLSearchParams();
    formURlData.set('city_id', this.pickupId);

    this.service.postAPI('get-city-terminal-cityid', formURlData.toString()).subscribe({
      next: (response) => {
        if (response.success) {
          this.pickupTerminals = response.data;
          //this.selectedPickupTerminalId = this.pickupTerminals[0].terminal_id;
        } else {
          this.toastr.warning(response.message);
        }
      },
      error: (error) => {
        if (error.error.message) {
          this.toastr.error(error.error.message);
        } else {
          this.toastr.error('Something went wrong!');
        }
      }
    });
  }

  dropoffTerminals: any;

  getDropoffTerminalsByCity() {
    const formURlData = new URLSearchParams();
    formURlData.set('city_id', this.dropoffId);

    this.service.postAPI('get-city-terminal-cityid', formURlData.toString()).subscribe({
      next: (response) => {
        if (response.success) {
          this.dropoffTerminals = response.data;
          //this.selectedDropTerminalId = this.dropoffTerminals[0].terminal_id;
        } else {
          this.toastr.warning(response.message);
        }
      },
      error: (error) => {
        if (error.error.message) {
          this.toastr.error(error.error.message);
        } else {
          this.toastr.error('Something went wrong!');
        }
      }
    });
  }

  isFieldTouched: { [key: string]: boolean } = {};
  onBlur(field: string): void {
    this.isFieldTouched[field] = true;
  }


}
