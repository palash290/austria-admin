import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../services/shared.service';
import { ErrorMessageService } from '../../../services/error-message.service';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [HeaderComponent, CommonModule, ReactiveFormsModule, FormsModule, LoaderComponent],
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
  allRoutes: any[] = [];
  newTicketPrice: number | null = null;
  newTicketType: string = '';
  newTicketTypes: any;

  constructor(private service: SharedService, private toastr: ToastrService, private errorMessageService: ErrorMessageService) { }

  ngOnInit() {
    this.getRoutesWithTicketTypes()
    //this.getType();
    this.initForm();
  }

  initForm() {
    this.form = new FormGroup({
      busName: new FormControl('', Validators.required),
    })
  }

  getRoutesWithTicketTypes() {
    this.service.getApi('get-all-ticket-type').subscribe({
      next: (resp: any) => {
        this.allRoutes = resp.data;
        this.extractTicketTypes();
      },
      error: (error) => {
        console.error(error.message);
      }
    });
  }

  ticketTypes: string[] = [];

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
    extractTicketTypes() {
      if (this.allRoutes.length > 0 && this.allRoutes[0].ticket_type.length > 0) {
        this.ticketTypes = Object.keys(this.allRoutes[0].ticket_type[0]).filter(
          (key) =>
            key !== 'ticket_type_id' &&
            key !== 'created_at' &&
            key !== 'updated_at' &&
            key !== 'routeRouteId' &&
            key !== 'is_deleted'
        );
      }
    }





  updateTicketPrice(route: any, ticketType: string, newPrice: string) {
    //debugger
    if(parseFloat(newPrice) >= 0){
      const updatedTicket = {
        ticket_type_id: route.ticket_type[0].ticket_type_id,
        ticket_type: ticketType,
        ticket_price: parseFloat(newPrice),
      };
  
      this.service.postData('update-ticket-price', updatedTicket).subscribe(response => {
        console.log('Ticket data successfully posted', response);
      }, error => {
        console.error('Error posting ticket data', error);
      });
    } else {
      this.toastr.error('Negative value not allow!')
    }

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
    // const busName = this.form.value.busName?.trim();

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
            this.getRoutesWithTicketTypes();
            this.form.reset();
            this.loading = false;
          } else {
            this.toastr.warning(resp.message);
            this.btnLoader = false;
            this.loading = false;
            this.getRoutesWithTicketTypes();
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

  updateId: any;

  patchUpdate(details: any) {
    //debugger
    this.updateId = details;
  }

  @ViewChild('closeModal2') closeModal2!: ElementRef;

  deleteTicketType() {
    //console.log(`Deleting header: ${header}`);
    const formURlData = new URLSearchParams();
    formURlData.set('ticket_type', this.updateId);

    this.service.postAPI(`delete-ticket-type`, formURlData.toString()).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.closeModal2.nativeElement.click();
          this.getRoutesWithTicketTypes();
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


}
