import { ChangeDetectorRef, Component } from '@angular/core';
import { SharedService } from '../../../../services/shared.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderComponent } from '../../loader/loader.component';

@Component({
  selector: 'app-add-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LoaderComponent],
  templateUrl: './add-booking.component.html',
  styleUrl: './add-booking.component.css'
})
export class AddBookingComponent {

  allCityFrom: any;
  fromId: any;
  toId: any;
  allCityTo: any;
  allBuses: any;
  date1: any;
  booking_id: any;
  loading: boolean = false;

  constructor(private apiService: SharedService, private toastr: NzMessageService, private route: Router, private activRout: ActivatedRoute, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.activRout.queryParams.subscribe({
      next: (params) => {
        this.booking_id = params['booking_id'];
      }
    });

    this.date1 = new Date().toISOString().split('T')[0];
    this.getAllRoutesFrom();
    this.getSingleRoutesFrom();
    this.dateValidation();
  }

  dateValidation() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Ensure two-digit month
    const day = today.getDate().toString().padStart(2, '0'); // Ensure two-digit day
    this.minDate = `${year}-${month}-${day}`; // Format as YYYY-MM-DD
  }

  getAllRoutesFrom() {
    this.apiService
      .getApi('get-all-city')
      .subscribe((res: any) => {
        if (res.success == true) {
          this.allCityFrom = res.data;
        }
      });
  }

  bookingData: any;
  minDate: any;

  getSingleRoutesFrom() {
    if (this.booking_id) {
      this.apiService
        .getApi(`get-booking-byid?booking_id=${this.booking_id}`)
        .subscribe((res: any) => {
          if (res.success == true) {
            this.bookingData = res.data;
            const data = res.data;

            this.firstName = data.first_name;
            this.lastName = data.last_name;
            this.email = data.email;
            this.phone = data.phone;
            this.notes = data.notes;

            this.payment_method = data.payment_method;

            this.date1 = data.travel_date;
            this.selectedFromId = data.from.city_id;
            this.selectedToId = data.to.city_id;
            this.getBuses();

            this.selectedBusId = data.route.route_id;
            this.getTicketTypeById(this.selectedBusId);

            this.departure_time = data.departure_time;
            this.arrival_time = data.arrival_time;

            // Prefill available cities and buses
            this.allCityFrom = data.allCityFrom || [];
            this.allCityTo = data.allCityTo || [];
            this.allBuses = data.allBuses || [];

            // this.fromId = data.allCityFrom || [];
            // this.toId = data.allCityTo || [];

            // Prefill seat selection
            this.passengers = data.passengers;
            this.number_of_seats = data.passengers?.length;

            //this.getBookedSeats();

            //this.selectedSeats = this.passengers.map((p: { selected_seat: any; }) => p.selected_seat); // Pre-fill selected seats

            this.selectedSeats = this.passengers
              .filter((p: { selected_seat: any }) => p.selected_seat !== null) // Exclude null values
              .map((p: { selected_seat: any }) => p.selected_seat);

            this.expandedTicketList = this.passengers.map((p: { ticket_type: any; selected_seat: any; passenger_name: any; price: any; }) => ({
              ticketType: p.ticket_type,
              selectedSeat: p.selected_seat || '',  // Assign the correct seat
              passengerName: p.passenger_name || '',
              price: p.price || 0
            }));

            // Prefill pricing details
            this.subtotal = data.subtotal;
            setTimeout(() => {
              this.prefillTicketSelection()
            }, 1000);
          }
        });
    }
  }

  //For remove the pre booked seats
  preBookSeats: number[] = [];

  getBookedSeats(route_id: any) {
    const formData = new URLSearchParams();
    formData.append('route', route_id);
    formData.append('from', this.selectedFromId);
    formData.append('to', this.selectedToId);
    formData.append('travel_date', this.date1);

    this.apiService
      .postAPI('get-booking-by-route-date-and-from-to', formData.toString())
      .subscribe((res: any) => {
        if (res.success === true && res.data) {
          this.preBookSeats = res.data
            .flatMap((booking: any) => booking.passengers)
            .filter((passenger: any) => passenger.selected_seat !== null)
            .map((passenger: any) => passenger.selected_seat);

          console.log('preBook Seats:', this.preBookSeats);
        } else {
          this.preBookSeats = [];
        }
      });
  }


  passengers: any;

  prefillTicketSelection() {
    // Reset ticket quantities
    this.ticketQuantities = {};

    // Populate ticket quantities from passengers
    this.passengers.forEach((passenger: { ticket_type: string | number; }) => {
      if (!this.ticketQuantities[passenger.ticket_type]) {
        this.ticketQuantities[passenger.ticket_type] = 0;
      }
      this.ticketQuantities[passenger.ticket_type] += 1;
    });

    // Update subtotal
    this.subtotal = this.expandedTicketList.reduce((sum, ticket) => sum + Number(ticket.price), 0);

    //this.onTicketQuantityChange();
    // console.log('Pre-filled ticket quantities:', this.ticketQuantities);
    // console.log('Pre-filled expanded ticket list:', this.expandedTicketList);


  }

  getAllRoutesTo(id: any) {
    this.apiService
      .getApi('get-all-city')
      .subscribe((res: any) => {
        if (res.success == true) {
          // Filter out the city with the selectedFromId
          this.allCityTo = res.data.filter((city: any) => city.city_id != id);
        }
      });
  }

  selectedFromId: any = '';
  selectedToId: any;
  selectedBusId: any;

  onFromChange(event: any): void {
    const selectedId = event.target.value;
    this.selectedFromId = selectedId;
    console.log('Selected austriaCityId ID:', this.selectedFromId);
    //this.getTicketTypeById(selectedId);
    this.getAllRoutesTo(this.selectedFromId);
  }

  onToChange(event: any): void {
    const selectedId = event.target.value;
    this.selectedToId = selectedId;
    //console.log('Selected austriaCityId ID:', this.selectedToId);
    //this.getTicketTypeById(selectedId);
    this.getBuses();
  }

  onBusChange(event: any): void {
    const selectedId = event.target.value;
    this.selectedBusId = selectedId;
    //console.log('Selected austriaCityId ID:', this.selectedBusId);
    this.getTicketTypeById(this.selectedBusId);

    // this.getBookedSeats();
  }

  onDateChange(): void {
    this.selectedFromId = '';
    this.selectedToId = '';
    this.selectedBusId = '';

    this.allCityTo = []; // Clear destination cities
    this.allBuses = [];  // Clear buses

    this.departure_time = '';
    this.arrival_time = '';

    console.log('Date changed, all selections reset.');
  }


  // number_of_seats: any;

  // getBuses() {
  //   this.allBuses = '';
  //   const formData = new URLSearchParams();
  //   formData.append('pickup_point', this.selectedFromId);
  //   formData.append('dropoff_point', this.selectedToId);
  //   formData.append('travel_date', this.date1);
  //   this.apiService
  //     .postAPIUser('http://13.61.168.187:4000/api/bus-search', formData.toString())
  //     .subscribe((res: any) => {
  //       if (res.success == true) {
  //         this.allBuses = res.data;
  //         // this.number_of_seats = res.data[0].bus.number_of_seats;
  //         // this.number_of_seats = Array.from({ length: 60 }, (_, i) => i);

  //         const numberOfSeats = res.data[0]?.bus?.number_of_seats;
  //         //console.log('this.numberOfSeats ', numberOfSeats);
  //         if (numberOfSeats) {
  //           this.number_of_seats = Array.from({ length: numberOfSeats + 1 }, (_, i) => i);
  //         } else {
  //           this.number_of_seats = [];
  //         }
  //         //console.log('this.number_of_seats ', this.number_of_seats);
  //       } else {
  //         this.allBuses = [];
  //       }
  //     });
  // }

  number_of_seats = 0;
  remaining_seats = 0;
  ticketQuantities: any = {};

  departure_time: any;
  arrival_time: any;
  route_id: any;

  getBuses() {

    this.allBuses = '';
    const formData = new URLSearchParams();
    formData.append('pickup_point', this.selectedFromId);
    formData.append('dropoff_point', this.selectedToId);
    formData.append('travel_date', this.date1);

    this.apiService
      .postAPIUser('http://13.61.168.187:4000/api/bus-search', formData.toString())
      .subscribe((res: any) => {
        if (res.success == true) {
          //debugger
          this.getBookedSeats(res.data[0]?.route.route_id);

          this.allBuses = res.data;
          this.departure_time = res.data[0]?.departure_time;
          this.arrival_time = res.data[0]?.arrival_time;
          this.route_id = res.data[0]?.route.route_id;
          const numberOfSeats = res.data[0]?.bus?.number_of_seats;
          if (numberOfSeats) {

            this.number_of_seats = numberOfSeats;
            this.remaining_seats = numberOfSeats;

            //this.seatOptions = Array.from({ length: this.number_of_seats }, (_, i) => i + 1);

            setTimeout(() => {
              this.seatOptions = Array.from({ length: this.number_of_seats }, (_, i) => i + 1)
                .filter(seat => !this.preBookSeats.includes(seat));

              console.log('Available Seats:', this.seatOptions);
            }, 1000);




            this.ticketQuantities = {};
            this.ticketTypes.forEach((ticketType, index) => {
              this.ticketQuantities[ticketType.label] = 0;
            });
          } else {
            this.number_of_seats = 0;
            this.remaining_seats = 0;
          }
        } else {
          this.allBuses = [];
          this.number_of_seats = 0;
          this.remaining_seats = 0;
        }
      });
  }

  getSeatOptions(ticketLabel: string): number[] {
    // Calculate the maximum available seats for this specific ticket type
    const selectedTicketsForOtherTypes = Object.keys(this.ticketQuantities)
      .filter(label => label !== ticketLabel) // Exclude the current ticket type
      .map(label => Number(this.ticketQuantities[label]) || 0) // Convert to numbers safely
      .reduce((acc, val) => acc + val, 0); // Sum up

    // Remaining seats minus what’s already selected for other ticket types
    const maxAvailableSeats = this.number_of_seats - selectedTicketsForOtherTypes;

    // Ensure the dropdown doesn’t offer more seats than possible
    //const seatOptions = Array.from({ length: maxAvailableSeats + 1 }, (_, i) => i);

    // Generate seat options and exclude already booked seats (preBookSeats)
    const seatOptions = Array.from({ length: maxAvailableSeats + 1 }, (_, i) => i)
      .filter(seat => !this.preBookSeats.includes(seat)); // Remove booked seats

    // Set the first option (index 1) as the default value if not already selected
    if (!this.ticketQuantities[ticketLabel] && seatOptions.length > 1) {
      this.ticketQuantities[ticketLabel] = seatOptions[0]; // Default to first valid seat (not 0)
    }

    return seatOptions;
  }

  // Remove seat without toggling dropdown
  removeSeat(event: Event, seat: number) {
    event.stopPropagation(); // Prevents dropdown toggle
    this.selectedSeats = this.selectedSeats.filter(s => s !== seat);
  }

  selectedTickets: { ticketType: string; seats: number, price: any }[] = [];

  expandedTicketList: any[] = [];
  subtotal: any = 0;

  // onTicketQuantityChange() {

  //   this.expandedTicketList = [];

  //   // Update the selectedTickets array
  //   this.selectedTickets = Object.entries(this.ticketQuantities).map(([ticketType, seats]) => {
  //     const ticket = this.ticketTypes.find(t => t.label === ticketType);
  //     return {
  //       ticketType,
  //       seats: Number(seats) || 0,
  //       price: ticket ? ticket.price : 0,  // Fetch the price
  //     };
  //   }).filter(ticket => ticket.seats > 0);

  //   this.subtotal = this.selectedTickets.reduce((sum, ticket: any) => sum + (ticket.seats * ticket.price), 0);

  //   // Create expanded ticket list based on seat count
  //   this.expandedTicketList = [];
  //   this.selectedTickets.forEach(ticket => {
  //     for (let i = 0; i < ticket.seats; i++) {
  //       this.expandedTicketList.push({
  //         ticketType: ticket.ticketType,
  //         selectedSeat: '',
  //         passengerName: '',
  //         price: ticket.price
  //       });
  //     }
  //   });
  //   console.log('this.selectedTickets', this.selectedTickets);
  //   console.log('this.expandedTicketList', this.expandedTicketList);

  //   // Create seat options from 1 to number_of_seats
  //   this.seatOptions = Array.from({ length: this.number_of_seats }, (_, i) => i + 1);
  // }
  onTicketQuantityChange() {
    const previousData = new Map();

    // Store previous seat and passenger data
    this.expandedTicketList.forEach((ticket, index) => {
      previousData.set(index, {
        passengerName: ticket.passengerName,
        selectedSeat: ticket.selectedSeat,
      });
    });

    const updatedExpandedTicketList: any[] = [];

    // Update selectedTickets array
    this.selectedTickets = Object.entries(this.ticketQuantities)
      .map(([ticketType, seats]) => {
        const ticket = this.ticketTypes.find(t => t.label === ticketType);
        return {
          ticketType,
          seats: Number(seats) || 0,
          price: ticket ? ticket.price : 0,
        };
      })
      .filter(ticket => ticket.seats > 0);

    // Recalculate subtotal
    this.subtotal = this.selectedTickets.reduce(
      (sum, ticket) => sum + ticket.seats * ticket.price,
      0
    );

    // Recreate the expanded ticket list while preserving previous selections
    let index = 0;
    this.selectedTickets.forEach(ticket => {
      for (let i = 0; i < ticket.seats; i++) {
        updatedExpandedTicketList.push({
          ticketType: ticket.ticketType,
          selectedSeat: previousData.has(index) ? previousData.get(index)?.selectedSeat : '',
          passengerName: previousData.has(index) ? previousData.get(index)?.passengerName : '',
          price: ticket.price,
        });
        index++;
      }
    });

    // Assign updated list without resetting selections
    this.expandedTicketList = updatedExpandedTicketList;

    console.log('Updated expandedTicketList:', this.expandedTicketList);
  }






  ticketTypes: any[] = [];

  getTicketTypeById(route_id?: any) {
    const formURlData = new URLSearchParams();
    formURlData.set('route_id', route_id);

    this.apiService.postAPI('get-ticket-type-by-routeid', formURlData.toString()).subscribe({
      next: (response) => {
        if (response.success) {
          const ticketTypeColumns = response.data[0].ticket_type_column;
          const ticketTypeValues = response.data[0].ticket_type[0];

          // Filter out 'Baseprice' and map the remaining columns
          this.ticketTypes = ticketTypeColumns
            .filter((column: any) => column.COLUMN_NAME !== 'Baseprice') // Exclude 'Baseprice'
            .map((column: any) => ({
              label: column.COLUMN_NAME,
              price: ticketTypeValues[column.COLUMN_NAME] || '0.00'
            }));

          console.log('this.ticketTypes', this.ticketTypes);
        } else {
          console.log(response.message);
        }
      },
      error: (error) => {
        console.log(error.error?.message || 'Something went wrong!');
      }
    });
  }




  dropdownOpen = false;
  selectedSeats: number[] = [];
  seatOptions: number[] = [];

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleSeatSelection(seat: number) {
    if (this.selectedSeats.includes(seat)) {
      // Remove the seat if it's already selected
      this.selectedSeats = this.selectedSeats.filter(s => s !== seat);
    } else if (this.selectedSeats.length < this.number_of_seats) {
      // Add the seat if it's not already selected and there's room
      this.selectedSeats.push(seat);
    }
    console.log('Selected Seats:', this.selectedSeats);
  }

  chosenSeats: any[] = [];

  checkDuplicateSeats(event: Event, index: number) {
    const selectedSeat = +(event.target as HTMLSelectElement).value;

    // Check if the seat is already selected elsewhere
    const duplicate = this.chosenSeats.some((seat, i) => seat === selectedSeat && i !== index);
    console.log(duplicate);

    if (duplicate) {
      this.toastr.warning(`Seat ${selectedSeat} is already selected. Please choose a different seat.`);

      // Reset the selected seat
      this.chosenSeats[index] = null;

      // Reset the dropdown visually
      setTimeout(() => {
        const seatSelect: any = document.getElementById(`seat-${index}`) as HTMLSelectElement;
        if (seatSelect) {
          seatSelect.value = '';
        }
      }, 0);
    } else {
      this.chosenSeats[index] = selectedSeat;
      console.log('Updated Selected Seats:', this.chosenSeats);
    }
  }


  selectedPaymentMethod: string = 'Cash';


  firstName: any;
  lastName: any;
  phone: any;
  email: any;
  notes: any;
  booking_status: any = '';

  saveBooking() {
    this.loading = true;
    // if (!this.selectedPaymentMethod) {
    //     this.toastr.warning("Please select a payment method");
    //     return;
    // }



    if (!this.firstName) {
      this.toastr.warning("Please enter first name");
      return;
    }
    if (!this.lastName) {
      this.toastr.warning("Please enter last name");
      return;
    }
    if (!this.email) {
      this.toastr.warning("Please enter email");
      return;
    }
    if (!this.phone) {
      this.toastr.warning("Please enter phone number");
      return;
    }
    if (!this.notes) {
      this.toastr.warning("Please enter notes");
      return;
    }

    // Convert to URL-encoded format
    const bookingDetails = new URLSearchParams();
    // Object.keys(bookingDetails).forEach(key => {
    //   urlEncodedData.append(key, bookingDetails[key]);
    // });

    if (this.booking_id) {
      bookingDetails.append('booking_id', this.booking_id);
      bookingDetails.append('booking_status', this.booking_status);
      bookingDetails.append('payment_method', this.selectedPaymentMethod);
      bookingDetails.append('subtotal', this.subtotal.toFixed(2));
      bookingDetails.append('tax', '0');
      bookingDetails.append('total', this.subtotal.toFixed(2));
      bookingDetails.append('deposit', this.subtotal.toFixed(2));
      bookingDetails.append('first_name', this.firstName);
      bookingDetails.append('last_name', this.lastName);
      bookingDetails.append('phone', this.phone);
      bookingDetails.append('email', this.email);
      bookingDetails.append('notes', this.notes);
      bookingDetails.append(
        'ticket_details',
        JSON.stringify(
          this.expandedTicketList.map(ticket => ({
            ticketType: ticket.ticketType,
            selectedSeat: ticket.selectedSeat,
            passengerName: ticket.passengerName,
            price: ticket.price
          }))
        )
      );
    } else {
      bookingDetails.append('route', this.route_id);
      bookingDetails.append('from', this.selectedFromId);
      bookingDetails.append('to', this.selectedToId);
      bookingDetails.append('travel_date', this.date1);
      bookingDetails.append('departure_time', this.departure_time);
      bookingDetails.append('arrival_time', this.arrival_time);
      bookingDetails.append('payment_method', this.selectedPaymentMethod);
      bookingDetails.append('subtotal', this.subtotal.toFixed(2));
      bookingDetails.append('tax', '0');
      bookingDetails.append('total', this.subtotal.toFixed(2));
      bookingDetails.append('deposit', this.subtotal.toFixed(2));
      bookingDetails.append('first_name', this.firstName);
      bookingDetails.append('last_name', this.lastName);
      bookingDetails.append('phone', this.phone);
      bookingDetails.append('email', this.email);
      bookingDetails.append('notes', this.notes);
      bookingDetails.append(
        'ticket_details',
        JSON.stringify(
          this.expandedTicketList.map(ticket => ({
            ticketType: ticket.ticketType,
            selectedSeat: ticket.selectedSeat,
            passengerName: ticket.passengerName,
            price: ticket.price
          }))
        )
      );
    }



    const url = this.booking_id ? 'update-booking-byid' : 'create-booking'

    this.apiService.postAPI(url, bookingDetails.toString()).subscribe({
      next: (response) => {
        if (response.success) {
          this.loading = false;
          this.toastr.success(response.message);
          this.route.navigateByUrl('/home/booking-management');
        } else {
          this.loading = false;
          this.toastr.warning(response.message);
        }
      },
      error: (error) => {
        this.loading = false;
        this.toastr.warning(error.error?.message || 'Something went wrong!');
      }
    });

    // console.log("Booking Details:", bookingDetails);
    // this.toastr.success("Booking saved successfully!");
  }

  ngOnDestroy() {
    this.booking_id = '';
  }

  showForm = false;
  payment_method: any = '';

  nextStep() {

    if (!this.date1) {
      this.toastr.warning("Please select a date");
      return;
    }

    if (!this.selectedFromId) {
      this.toastr.warning("Please select a departure city (From)");
      return;
    }

    if (!this.selectedToId) {
      this.toastr.warning("Please select a destination city (To)");
      return;
    }

    if (!this.selectedBusId) {
      this.toastr.warning("Please select a bus");
      return;
    }

    // Check if at least one ticket is selected
    if (!Object.values(this.ticketQuantities).some((qty: any) => qty > 0)) {
      this.toastr.warning("Please select at least one ticket type");
      return;
    }

    // Validate each ticket has a seat and passenger name
    for (const ticket of this.expandedTicketList) {
      if (!ticket.selectedSeat) {
        this.toastr.warning(`Please assign a seat for ${ticket.ticketType}`);
        return;
      }
      if (!ticket.passengerName) {
        this.toastr.warning(`Please enter passenger name for ${ticket.ticketType}`);
        return;
      }
    }

    // If `booking_id` is present, ensure `booking_status` is selected
    if (this.booking_id && !this.booking_status) {
      this.toastr.warning("Please select a booking status");
      return;
    }

    // If `booking_id` is present, ensure `booking_status` is selected
    if (!this.payment_method) {
      this.toastr.warning("Please select a payment method");
      return;
    }

    this.showForm = true; // Show form when clicking Next
  }

  previousStep() {
    this.showForm = false; // Show form when clicking Next
  }


}
