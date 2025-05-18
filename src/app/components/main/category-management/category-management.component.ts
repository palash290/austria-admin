import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { ErrorMessageService } from '../../../services/error-message.service';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LoaderComponent, RouterLink],
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.css'
})
export class CategoryManagementComponent {

  totalPagesArray: number[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  pageSizeOptions = [5, 10, 25, 50];
  searchQuery: any = '';
  data: any;
  form!: FormGroup;
  loading: boolean = false;
  @ViewChild('closeModal') closeModal!: ElementRef;
  @ViewChild('closeModal1') closeModal1!: ElementRef;
  allRoutes: any;
  newTicketPrice: number | null = null;
  newTicketType: string = '';
  newTicketTypes: any;
  status: boolean = true;
  route_id: any;
  isSingle = '';

  @Input() routeId: string = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['routeId'] && changes['routeId'].currentValue) {
      console.log('Received route_id:', this.routeId);
      this.route_id = this.routeId
      this.getTicketTypeById()
      this.initForm();
      this.addRouteById1();
    }
  }

  constructor(private service: SharedService, private toastr: NzMessageService, private errorMessageService: ErrorMessageService, private router: Router, private activRout: ActivatedRoute) { }

  ngOnInit() {
    this.activRout.queryParams.subscribe({
      next: (params) => {
        this.route_id = params['route_id'];
        this.isSingle = params['isSingle'];
        // if (this.route_id) {
        //   this.addTicketType(this.route_id)
        // }
        //console.log(this.route_id);
      }
    })
    this.getTicketTypeById()
    //this.getType();
    this.initForm();
    this.addRouteById1();
  }

  initForm() {
    this.form = new FormGroup({
      busName: new FormControl('', Validators.required),
    })
  }

  ticketTypes: any[] = [];
  stopNames: any;

  getTicketTypeById(filterId?: any) {
    if (!this.route_id) {
      return
    }
    const formURlData = new URLSearchParams();
    formURlData.set('route_id', this.route_id);
    //formURlData.set('stop_id', filterId ? filterId : "");
    // formURlData.set('pickup_point', this.fromId);
    // formURlData.set('dropoff_point', this.toId);
    this.service.postAPI('get-ticket-type-by-route-line-id', formURlData.toString()).subscribe({
      next: (response) => {
        if (response.success) {
          this.allRoutes = response.data[0].ticket_type;
          console.log(this.allRoutes);
          this.ticketTypes = response.data[0].ticket_type_column;
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

  addRouteById1() {
    if (this.route_id) {
      const formURlData = new URLSearchParams();
      formURlData.set('route_id', this.route_id);
      this.service.postAPI('get-route-by-id', formURlData.toString()).subscribe({
        next: (response) => {
          if (response.success) {
            //this.lines = response.data.route_stops;
            this.stopNames = response.data.route_stops.map((item: any) => ({
              start_city_name: item.stop_city.city_name,
              startPointCityId: item.stop_city.city_id
            }));

            // Remove duplicates
            // this.stopNames = stopNamesWithDuplicates.filter(
            //   (item: { start_city_name: any; }, index: any, self: any[]) =>
            //     index === self.findIndex((t) => t.start_city_name === item.start_city_name)
            // );
            console.log('this.stopNames', this.stopNames);
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

  // getRoutesWithTicketTypes() {
  //   this.service.getApi('get-all-ticket-type').subscribe({
  //     next: (resp: any) => {
  //       this.allRoutes = resp.data;
  //       this.extractTicketTypes();
  //     },
  //     error: (error) => {
  //       console.error(error.message);
  //     }
  //   });
  // }


  // extractTicketTypes() {
  //   if (this.allRoutes.length > 0 && this.allRoutes[0].ticket_type.length > 0) {
  //     // Get keys from the first object in the ticket_type array
  //     this.ticketTypes = Object.keys(this.allRoutes[0].ticket_type[0]).filter(
  //       (key) => key !== 'ticket_type_id' && key !== 'created_at' && key !== 'updated_at' && key !== 'routeRouteId' && key !== 'is_deleted'
  //     );
  //   }
  //   console.log();

  // }

  // Extract ticket type keys dynamically from the first route
  // extractTicketTypes() {
  //   if (this.allRoutes.length > 0 && this.allRoutes[0].ticket_type_column.length > 0) {
  //     this.ticketTypes = Object.keys(this.allRoutes[0].ticket_type_column[0]).filter(
  //       (key) =>
  //         key !== 'ticket_type_id' &&
  //         key !== 'created_at' &&
  //         key !== 'updated_at' &&
  //         key !== 'routeRouteId' &&
  //         key !== 'is_deleted'
  //     );
  //   }
  // }



  // updateTicketPrice(route: any, ticketType: any, newPrice: any) {
  //   //debugger
  //   if (parseFloat(newPrice) >= 0) {
  //     const updatedTicket = {
  //       ticket_type_id: route.ticket_type_id,
  //       ticket_type: ticketType,
  //       ticket_price: parseFloat(newPrice),
  //       is_active: route.is_active
  //     };

  //     this.service.postData('update-ticket-price', updatedTicket).subscribe(response => {
  //       console.log('Ticket data successfully posted', response);
  //     }, error => {
  //       console.error('Error posting ticket data', error);
  //     });
  //   } else {
  //     this.toastr.error('Negative value not allow!')
  //   }

  // }


  updatedTickets: any[] = []; // Array to track updated ticket prices

  updateTicketPrice(ticket: any, field: string, newValue: any) {
    //debugger
    if (parseFloat(newValue) <= 0) {
      this.toastr.error('Price should be greater than 0');
      return
    }
    //if (parseFloat(newValue) >= 0) {
    // Update the ticket object locally
    ticket[field] = newValue;

    // Add to updatedTickets array if not already present
    const existingTicket = this.updatedTickets.find(t => t.ticket_type_id === ticket.ticket_type_id);
    if (existingTicket) {
      existingTicket[field] = newValue;
    } else {
      this.updatedTickets.push({
        ticket_type_id: ticket.ticket_type_id,
        is_active: ticket.is_active,
        Adult: ticket.Adult,
        Child: ticket.Child,
        Baseprice: ticket.Baseprice,
      });
    }
    // } else {
    //   this.toastr.error('Negative value not allowed!');
    // }
  }

  saveUpdatedTicketPrices() {
    if (this.updatedTickets.length > 0) {
      this.service.postData('update-ticket-price', this.updatedTickets).subscribe(
        res => {
          if (res.success == true) {
            this.toastr.success(res.message);
            this.updatedTickets = []; // Clear the updated tickets array
            this.router.navigate(['/home/routes-management'])
          } else {
            this.toastr.warning(res.message);
          }
        },
        error => {
          // console.error('Error updating ticket data', error);
          // this.toastr.error('Error updating ticket data');
          if (error.error.message) {
            this.toastr.error(error.error.message);
          } else {
            this.toastr.error('Something went wrong!');
          }
        }
      );
    } else {
      this.toastr.warning('No updates to save');
    }
  }

  statusChange(ticket: any, status: any) {
    //console.log(status);
    this.updatedTickets.push({
      ticket_type_id: ticket.ticket_type_id,
      is_active: status ? 0 : 1,
      Adult: ticket.Adult,
      Child: ticket.Child,
      Baseprice: ticket.Baseprice,
    });
    console.log(this.updatedTickets);
  }

  ngOnDestroy() {
    this.updatedTickets = [];
    this.isSingle = '';
  }

  // Update all ticket prices

  // updateAllTicketPrices() {
  //   const updatedTickets: any[] = [];

  //   this.allRoutes.forEach((route) => {
  //     route.ticket_type.forEach((ticket: any) => {
  //       this.ticketTypes.forEach((type) => {
  //         const price = ticket[type];
  //         if (price >= 0) {
  //           updatedTickets.push({
  //             ticket_type_id: ticket.ticket_type_id,
  //             ticket_type: type,
  //             ticket_price: price,
  //           });
  //         } else {
  //           this.toastr.error(`Negative value not allowed for ${type}!`);
  //         }
  //       });
  //     });
  //   });

  //   if (updatedTickets.length > 0) {
  //     this.service
  //       .postData('update-ticket-price', { tickets: updatedTickets })
  //       .subscribe(
  //         (response) => {
  //           this.toastr.success('Ticket prices updated successfully!');
  //           console.log('Response:', response);
  //         },
  //         (error) => {
  //           this.toastr.error('Failed to update ticket prices');
  //           console.error('Error:', error);
  //         }
  //       );
  //   }
  // }

  addTicketType(routeId: number) {
    if (!this.newTicketType || !this.newTicketPrice) {
      alert('Please enter both ticket type and price.');
      return;
    }

    const payload = {
      ticket_type: [
        {
          route: routeId,
          ticket_type: this.newTicketType,
          ticket_price: this.newTicketPrice,
        },
      ],
    };

    this.service
      .postData('create-ticket-type', payload)
      .subscribe({
        next: (resp) => {
          console.log('Ticket type added successfully:', resp);
          //this.getRoutes(); // Refresh the routes list
          this.newTicketType = '';
          this.newTicketPrice = null;
        },
        error: (err) => {
          console.error('Error adding ticket type:', err.message);
        },
      });
  }

  btnLoader: boolean = false;

  addType() {
    this.form.markAllAsTouched();

    const busName = this.form.value.busName?.trim();
    this.form.patchValue({ busName });

    if (!busName) {
      return;
    }

    if (this.form.valid) {
      this.btnLoader = true;
      this.loading = true;
      const formURlData = new URLSearchParams();
      formURlData.set('ticket_type', this.form.value.busName);

      this.service.postAPI('create-ticket-type', formURlData.toString()).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.btnLoader = false;
            this.closeModal.nativeElement.click();
            this.getTicketTypeById();
            this.form.reset();
            this.loading = false;
          } else {
            this.toastr.warning(resp.message);
            this.btnLoader = false;
            this.loading = false;
            this.getTicketTypeById();
          }
        },
        error: (error) => {
          this.btnLoader = false;
          this.loading = false;
          if (error.error.message) {
            this.toastr.error(error.error.message);
          } else {
            this.toastr.error('Something went wrong!');
          }
        }
      });
    }
  }

  COLUMN_NAMEId: any;

  patchUpdate(details: any) {
    //debugger
    this.COLUMN_NAMEId = details;
  }

  @ViewChild('closeModal2') closeModal2!: ElementRef;

  deleteTicketType() {
    //console.log(`Deleting header: ${header}`);
    const formURlData = new URLSearchParams();
    formURlData.set('ticket_type', this.COLUMN_NAMEId);

    this.service.postAPI(`delete-ticket-type`, formURlData.toString()).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.closeModal2.nativeElement.click();
          this.getTicketTypeById();
          this.toastr.success(resp.message)

        } else {

          this.toastr.warning('Something went wrong!');
          //this.getType();
        }
      },
    });
  }


  getErrorMessage(controlName: any): string {
    let control: any = this.form.get(controlName);
    return this.errorMessageService.getErrorMessage(control)
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    //this.getType();
  }

  changePageSize(newPageSize: number) {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    //this.getType();
  }

  cancel() {
    this.router.navigate(['/home/routes-management'])
  }

  selectedBusId: any = '';
  selectedBusName: any;

  onStopChange(event: any): void {
    const selectedId = event.target.value;
    this.selectedBusId = selectedId;
    console.log('Selected austriaCityId ID:', this.selectedBusId);
    this.getTicketTypeById(selectedId);
  }


}
