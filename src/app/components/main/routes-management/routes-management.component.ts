import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorMessageService } from '../../../services/error-message.service';

@Component({
  selector: 'app-routes-management',
  standalone: true,
  imports: [HeaderComponent, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './routes-management.component.html',
  styleUrl: './routes-management.component.css'
})
export class RoutesManagementComponent {

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

  constructor(private service: SharedService, private toastr: ToastrService, private errorMessageService: ErrorMessageService) { }

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
    //debugger
    if (this.selectedAustriaCityId) {
      const formURlData = new URLSearchParams();
      formURlData.set('address', `${this.selectedAustriaCityName}, Austria`);

      this.service.postAPI('get-lat-long', formURlData.toString()).subscribe(response => {
        if (response.success) {
          this.letLongAustria = response.data;
          console.log(' this.letLongAustria',  this.letLongAustria);
          
        }
      });
    }
  }

  getLetLongUkrane() {
    //debugger
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
    this.service.getApi('get-all-routes').subscribe({
      next: resp => {
        this.data = resp.data;
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

//   {
//     "success": true,
//     "status": 200,
//     "message": "Routes fetched successfully.",
//     "data": [
//         {
//             "route_id": 1,
//             "route_direction": "Austria to Ukraine",
//             "distance_km": 1270.25,
//             "fixed_price": "550.26",
//             "estimated_time": null,
//             "description": null,
//             "is_active": true,
//             "created_at": "2025-01-03T11:47:11.902Z",
//             "updated_at": "2025-01-03T11:47:11.902Z",
//             "start_location_lat_long": "47.25108029124747, 11.339660839553623",
//             "end_location_lat_long": "49.83969879344121, 24.029680194433602",
//             "pickup_point": {
//                 "city_id": 1,
//                 "country_name": "Austria",
//                 "city_name": "Innsbruck",
//                 "is_active": true,
//                 "created_at": "2025-01-03T09:28:36.442Z",
//                 "updated_at": "2025-01-03T09:28:36.442Z"
//             },
//             "dropoff_point": {
//                 "city_id": 16,
//                 "country_name": "Ukraine",
//                 "city_name": "Lviv",
//                 "is_active": true,
//                 "created_at": "2025-01-03T09:56:41.646Z",
//                 "updated_at": "2025-01-03T09:56:41.646Z"
//             }
//         }
//     ]
// }

  onAustriaCityChange(event: any): void {
    //debugger
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
      const formURlData = new URLSearchParams();
      formURlData.set('route_direction', `Austria to Ukraine`);
      formURlData.set('pickup_point', this.selectedAustriaCityId);
      formURlData.set('dropoff_point', this.selectedUkraneCityId);
      formURlData.set('fixed_price', this.price);
      formURlData.set('start_location_lat_long', `${this.letLongAustria.lat}, ${this.letLongAustria.lng}`);
      formURlData.set('end_location_lat_long', `${this.letLongUkrane.lat}, ${this.letLongUkrane.lng}`);

      this.service.postAPI('create-route', formURlData.toString()).subscribe(response => {
        if (response.success) {
          this.letLongUkrane = response.data;
        }
      });
    } else {
      const formURlData = new URLSearchParams();
      formURlData.set('route_direction', `Ukraine to Austria`);
      formURlData.set('pickup_point', this.selectedUkraneCityId);
      formURlData.set('dropoff_point', this.selectedAustriaCityId);
      formURlData.set('fixed_price', this.price);
      formURlData.set('start_location_lat_long', `${this.letLongUkrane.lat}, ${this.letLongUkrane.lng}`);
      formURlData.set('end_location_lat_long', `${this.letLongAustria.lat}, ${this.letLongAustria.lng}`);
      this.service.postAPI('create-route', formURlData.toString()).subscribe(response => {
        if (response.success) {
          this.letLongUkrane = response.data;
        }
      });
    }
  }

  updateDet: any;
  updateId: any;
  updatePrice: any;

  patchUpdate(details: any) {
    //debugger
    this.updateDet = details;
    this.updatePrice =  details.fixed_price;
    this.updateId = details.route_id;
  }


}
