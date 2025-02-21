import { Component } from '@angular/core';
import { SharedService } from '../../../../services/shared.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-add-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-booking.component.html',
  styleUrl: './add-booking.component.css'
})
export class AddBookingComponent {

  allCityFrom: any;
  allCityTo: any;
  allBuses: any;
  date1: any;

  constructor(private apiService: SharedService, private toastr: NzMessageService) { }

  ngOnInit() {
    this.date1 = new Date().toISOString().split('T')[0];
    this.getAllRoutesFrom();
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
    console.log('Selected austriaCityId ID:', this.selectedToId);
    //this.getTicketTypeById(selectedId);
    this.getBuses();
  }

  onBusChange(event: any): void {
    const selectedId = event.target.value;
    this.selectedBusId = selectedId;
    console.log('Selected austriaCityId ID:', this.selectedBusId);
    this.getTicketTypeById(this.selectedBusId);
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
          this.allBuses = res.data;

          const numberOfSeats = res.data[0]?.bus?.number_of_seats;
          if (numberOfSeats) {

            this.number_of_seats = numberOfSeats;
            this.remaining_seats = numberOfSeats;

            //debugger
            this.seatOptions = Array.from({ length: this.number_of_seats }, (_, i) => i + 1);

            this.ticketQuantities = {};
            this.ticketTypes.forEach((ticketType, index) => {
              this.ticketQuantities[ticketType.label] = 0;
            });
            //this.onTicketQuantityChange(); 
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
    const seatOptions = Array.from({ length: maxAvailableSeats + 1 }, (_, i) => i);
  
    // Set the first option (index 1) as the default value if not already selected
    if (!this.ticketQuantities[ticketLabel] && seatOptions.length > 1) {
      this.ticketQuantities[ticketLabel] = seatOptions[0]; // Default to first valid seat (not 0)
    }
  
    return seatOptions;
  }
  

  selectedTickets: { ticketType: string; seats: number }[] = [];

  expandedTicketList: any[] = [];
  subtotal: any = 0;

  // onTicketQuantityChange() {
  //   // Update the selectedTickets array
  //   this.selectedTickets = Object.entries(this.ticketQuantities).map(([ticketType, seats]) => ({
  //     ticketType,
  //     seats: Number(seats) || 0,
  //   })).filter(ticket => ticket.seats > 0);

  //   // Create expanded ticket list based on seat count
  //   this.expandedTicketList = [];
  //   this.selectedTickets.forEach(ticket => {
  //     for (let i = 0; i < ticket.seats; i++) {
  //       this.expandedTicketList.push({
  //         ticketType: ticket.ticketType,
  //         selectedSeat: null, // Placeholder for selected seat
  //         passengerName: '',  // Placeholder for passenger name
  //       });
  //     }
  //   });

  //   // Create seat options from 1 to number_of_seats
  //   this.seatOptions = Array.from({ length: this.number_of_seats }, (_, i) => i + 1);
  // }

  onTicketQuantityChange() {
    // Update the selectedTickets array
    this.selectedTickets = Object.entries(this.ticketQuantities).map(([ticketType, seats]) => {
      const ticket = this.ticketTypes.find(t => t.label === ticketType);
      return {
        ticketType,
        seats: Number(seats) || 0,
        price: ticket ? ticket.price : 0,  // Fetch the price
      };
    }).filter(ticket => ticket.seats > 0);

    // Calculate the Subtotal (Sum of all ticket prices)
    this.subtotal = this.selectedTickets.reduce((sum, ticket: any) => sum + (ticket.seats * ticket.price), 0);

    // Create expanded ticket list based on seat count
    this.expandedTicketList = [];
    this.selectedTickets.forEach(ticket => {
      for (let i = 0; i < ticket.seats; i++) {
        this.expandedTicketList.push({
          ticketType: ticket.ticketType,
          selectedSeat: null,
          passengerName: '',
        });
      }
    });

    // Create seat options from 1 to number_of_seats
    this.seatOptions = Array.from({ length: this.number_of_seats }, (_, i) => i + 1);
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
    //debugger
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








}
