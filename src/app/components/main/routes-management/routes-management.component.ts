import { Component, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorMessageService } from '../../../services/error-message.service';
import { Router, RouterLink } from '@angular/router';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-routes-management',
  standalone: true,
  imports: [HeaderComponent, CommonModule, ReactiveFormsModule, FormsModule, RouterLink, LoaderComponent],
  templateUrl: './routes-management.component.html',
  styleUrl: './routes-management.component.css'
})
export class RoutesManagementComponent {
  totalPagesArray: number[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  pageSizeOptions = [5, 10, 25, 50];
  searchQuery: any = '';
  data: any;
  form!: FormGroup;
  selectedOption: string = '1';
  austriaCity: any;
  price: any;
  selectedAustriaCityId: any;
  selectedAustriaCityName: any;
  ukraneCity: any;
  selectedUkraneCityId: any;
  selectedUkraneCityName: any;
  loading: boolean = false;
  @ViewChild('closeModal') closeModal!: ElementRef;
  @ViewChild('closeModal1') closeModal1!: ElementRef;

  constructor(private service: SharedService, private toastr: ToastrService, private errorMessageService: ErrorMessageService, private router: Router) { }

  ngOnInit() {
    this.getRoutes();
    this.getAustriaCityName();
    this.getUkraneCityName();
  }

  getAustriaCityName() {

    const formURlData = new URLSearchParams();
    formURlData.set('country_name', 'Austria');

    this.service.postAPI('get-cityby-countryname', formURlData.toString()).subscribe(response => {
      if (response.success) {
        this.austriaCity = response.data;
        this.selectedAustriaCityId = this.austriaCity[0].city_id;
        this.selectedAustriaCityName = this.austriaCity[0].city_name;
        this.getLetLongAustria();
      }
    });
  }

  getUkraneCityName() {

    const formURlData = new URLSearchParams();
    formURlData.set('country_name', 'Ukraine');

    this.service.postAPI('get-cityby-countryname', formURlData.toString()).subscribe(response => {
      if (response.success) {
        this.ukraneCity = response.data;
        this.selectedUkraneCityId = this.ukraneCity[0].city_id;
        this.selectedUkraneCityName = this.ukraneCity[0].city_name;
        this.getLetLongUkrane();
      }
    });
  }

  letLongAustria: any;
  letLongUkrane: any;

  getLetLongAustria() {
    if (this.selectedAustriaCityId) {
      const formURlData = new URLSearchParams();
      formURlData.set('address', `${this.selectedAustriaCityName}, Austria`);

      this.service.postAPI('get-lat-long', formURlData.toString()).subscribe(response => {
        if (response.success) {
          this.letLongAustria = response.data;
          console.log(' this.letLongAustria', this.letLongAustria);

        }
      });
    }
  }

  getLetLongUkrane() {
    if (this.selectedUkraneCityId) {
      const formURlData = new URLSearchParams();
      formURlData.set('address', `${this.selectedUkraneCityName}, Ukraine`);

      this.service.postAPI('get-lat-long', formURlData.toString()).subscribe(response => {
        if (response.success) {
          this.letLongUkrane = response.data;
        }
      });
    }
  }

  getRoutes() {
    this.service.getApi(`get-all-routes-by-limit-search?page=${this.currentPage}&limit=${this.pageSize}&filter=${this.searchQuery}`).subscribe({
      next: resp => {
        this.data = resp.data.routes;
        this.totalPages = resp.data.pagination?.totalPages
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  onAustriaCityChange(event: any): void {
    const selectedId = event.target.value;
    const selectedCategory = this.austriaCity.find((language: any) => language.city_id == selectedId);

    if (selectedCategory) {
      this.selectedAustriaCityId = selectedId;
      this.selectedAustriaCityName = selectedCategory.city_name;
      this.getLetLongAustria();
      console.log('Selected austriaCityId ID:', this.selectedAustriaCityId);
      console.log('Selected austriaCity name:', this.selectedAustriaCityName);
      //this.getQuestions(this.languageId)
    }
  }

  onUkraneCityChange(event: any): void {
    const selectedId = event.target.value;
    const selectedCategory = this.ukraneCity.find((language: any) => language.city_id == selectedId);

    if (selectedId) {
      this.selectedUkraneCityId = selectedId;
      this.selectedUkraneCityName = selectedCategory.city_name;
      this.getLetLongUkrane();
      console.log('Selected ukraneCityId ID:', this.selectedUkraneCityId);
      console.log('Selected ukraneCity name:', this.selectedAustriaCityName);
      //this.getQuestions(this.languageId)
    }
  }

  addRoute() {
    if (this.selectedOption == '1') {
      this.loading = true;
      const formURlData = new URLSearchParams();
      formURlData.set('route_direction', `Austria to Ukraine`);
      formURlData.set('pickup_point', this.selectedAustriaCityId);
      formURlData.set('dropoff_point', this.selectedUkraneCityId);
      //formURlData.set('fixed_price', this.price);
      //formURlData.set('start_location_lat_long', `${this.letLongAustria.lat}, ${this.letLongAustria.lng}`);
      //formURlData.set('end_location_lat_long', `${this.letLongUkrane.lat}, ${this.letLongUkrane.lng}`);

      this.service.postAPI('create-route', formURlData.toString()).subscribe(response => {
        if (response.success) {
          this.letLongUkrane = response.data;
          this.closeModal.nativeElement.click();
          this.toastr.success(response.message);
          this.getRoutes();
          this.loading = false;
        }
      });
    } else {
      this.loading = true;
      const formURlData = new URLSearchParams();
      formURlData.set('route_direction', `Ukraine to Austria`);
      formURlData.set('pickup_point', this.selectedUkraneCityId);
      formURlData.set('dropoff_point', this.selectedAustriaCityId);
      //formURlData.set('fixed_price', this.price);
      //formURlData.set('start_location_lat_long', `${this.letLongUkrane.lat}, ${this.letLongUkrane.lng}`);
      //formURlData.set('end_location_lat_long', `${this.letLongAustria.lat}, ${this.letLongAustria.lng}`);
      this.service.postAPI('create-route', formURlData.toString()).subscribe({
        next: (response) => {
          if (response.success) {
            //this.letLongUkrane = response.data;
            this.closeModal.nativeElement.click();
            this.toastr.success(response.message);
            this.getRoutes();
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
  }

  updateDet: any;
  updateId: any;
  updatePrice: any;

  patchUpdate(details: any) {
    this.updateDet = details;
    this.updatePrice = details.fixed_price;
    this.updateId = details.route_id;
  }

  @ViewChild('closeModal21') closeModal21!: ElementRef;

  deleteRoute() {
    const formURlData = new URLSearchParams();
    formURlData.set('route_id', this.updateId);
    //this.btnDelLoader = true;
    this.service.postAPI(`delete-route`, formURlData.toString()).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.closeModal21.nativeElement.click();
          this.toastr.success(resp.message)
          this.getRoutes();
          //this.btnDelLoader = false;
        } else {
          //this.btnDelLoader = false;
          this.toastr.warning('Something went wrong!');
          this.getRoutes();
        }
      },
    });
  }

  goToSchedule(route_id: any, pickupId: any, dropoffId: any) {
    this.router.navigateByUrl(`/home/bus-schedule/${route_id}/${pickupId}/${dropoffId}`)
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.getRoutes();
  }

  changePageSize(newPageSize: number) {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.getRoutes();
  }


}
