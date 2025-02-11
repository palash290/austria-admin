import { Component, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { ErrorMessageService } from '../../../services/error-message.service';
import { Router, RouterLink } from '@angular/router';
import { LoaderComponent } from '../loader/loader.component';
import { NzMessageService } from 'ng-zorro-antd/message';
declare var google: any;

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
  @ViewChild('closeModal12') closeModal12!: ElementRef;

  stopName: any;
  terminalName: any;
  allRoutes: any;
  lines: any
  showMessage(): void {
    this.toastr.create('success', 'This is a success message!', { nzDuration: 20000 }); // 20 seconds
  }

  constructor(private service: SharedService, private toastr: NzMessageService, private router: Router) { }

  ngOnInit() {
    this.getRoutes();
    // this.getAustriaCityName();
    // this.getUkraneCityName();
    this.getAllCity();

  }

  getAllCity() {
    this.service.getApi('get-all-city').subscribe({
      next: resp => {
        this.allRoutes = resp.data;
        this.initMap();
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  getRoutes() {
    this.service.getApi(`get-all-routes`).subscribe({
      next: resp => {
        this.lines = resp.data;
        this.totalPages = resp.data.pagination?.totalPages
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  singleLatLog: any;
  isSingleLatLog: boolean = false;

  getLatLog(latLog: any) {
    if(this.isSingleLatLog && JSON.stringify(this.singleLatLog) == JSON.stringify(latLog)){
      this.isSingleLatLog = false;
      this.initMap();
    }else{
      this.isSingleLatLog = true;
    // this.isSingleLatLog = !this.isSingleLatLog;
    this.singleLatLog = latLog;
    this.initMap();
    }
  }

  initMap(): void {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB0V1g5YyGB_NE1Lw1QitZZGECA5-1Xnng`;
    script.onload = () => this.createMap();
    document.body.appendChild(script);
  }

  // createMap(): void {
  //   const mapOptions = {
  //     zoom: 9,
  //     center: { lat: 25.304867300025933, lng: 78.56014738728993 }
  //   };

  //   const map = new google.maps.Map(document.getElementById('map') as HTMLElement, mapOptions);
  //   const bounds = new google.maps.LatLngBounds();

  //   const infoWindow = new google.maps.InfoWindow();

  //   this.allRoutes.forEach((city: any) => {
  //     if (city.latitude && city.longitude) {
  //       const marker = new google.maps.Marker({
  //         position: { lat: parseFloat(city.latitude), lng: parseFloat(city.longitude) },
  //         map: map,
  //         title: city.city_name || 'City Location'
  //       });

  //       // Extend bounds to include this marker's position
  //       bounds.extend(new google.maps.LatLng(parseFloat(city.latitude), parseFloat(city.longitude)));

  //       // Click event to open InfoWindow with buttons
  //       marker.addListener("click", () => {
  //         infoWindow.setContent(`
  //           <div>
  //             <h4>${city.city_name}</h4>
  //             <button onclick="editCity('${city.city_name}')">Edit</button>
  //             <button onclick="deleteCity('${city.city_name}')">Delete</button>
  //           </div>
  //         `);
  //         infoWindow.open(map, marker);
  //       });
  //     }
  //   });

  //   // Fit the map bounds to include all markers
  //   map.fitBounds(bounds);
  // }


  createMap(): void {
    // Default center if no tasks
    const mapOptions = {
      zoom: 9,
      center: { lat: 25.304867300025933, lng: 78.56014738728993 }
    };

    const map = new google.maps.Map(document.getElementById('map') as HTMLElement, mapOptions);
    const bounds = new google.maps.LatLngBounds();

    const infoWindow = new google.maps.InfoWindow();
    if (this.singleLatLog?.length > 0 && this.isSingleLatLog) {
      this.singleLatLog.forEach((city: any, index: number) => {
        if (city.stop_city.latitude && city.stop_city.longitude) {
          const marker = new google.maps.Marker({
            position: { lat: parseFloat(city.stop_city.latitude), lng: parseFloat(city.stop_city.longitude) },
            map: map,
            title: city.stop_city.city_name || 'City Location',
            label: `${index + 1}`
          });

          // Extend bounds to include this marker's position
          bounds.extend(new google.maps.LatLng(parseFloat(city.stop_city.latitude), parseFloat(city.stop_city.longitude)));

          // Click event to open InfoWindow with buttons
          marker.addListener("click", () => {
            infoWindow.setContent(`
            <div>
   
              <h4>${city.stop_city.city_name}</h4>
           <button id="editBtn" class="custom-edit-btn">Edit</button>
           <button id="deleteBtn" class="custom-delete-btn">Delete</button>
            </div>
          `);
            infoWindow.open(map, marker);

            setTimeout(() => {
              document.getElementById("editBtn")?.addEventListener("click", () => this.editCity(city.stop_city.city_id));
              document.getElementById("deleteBtn")?.addEventListener("click", () => this.deleteCity(city.stop_city.city_id));
            }, 100);
          });

        }
      });
    } else {
      // Loop through the cities in this.allRoutes and add markers
      this.allRoutes.forEach((city: any) => {
        if (city.latitude && city.longitude) {
          const marker = new google.maps.Marker({
            position: { lat: parseFloat(city.latitude), lng: parseFloat(city.longitude) },
            map: map,
            title: city.city_name || 'City Location'
          });

          // Extend bounds to include this marker's position
          bounds.extend(new google.maps.LatLng(parseFloat(city.latitude), parseFloat(city.longitude)));

          // Click event to open InfoWindow with buttons
          marker.addListener("click", () => {
            infoWindow.setContent(`
            <div>
           
              <h4>${city.city_name}</h4>
              <button id="editBtn" onclick="editCity('${city.city_name}'">Edit</button>
              <button id="deleteBtn" onclick="deleteCity('${city.city_name}')">Delete</button>
            </div>
          `);
            infoWindow.open(map, marker);

            setTimeout(() => {
              document.getElementById("editBtn")?.addEventListener("click", () => this.editCity(city.city_id));
              document.getElementById("deleteBtn")?.addEventListener("click", () => this.deleteCity(city.city_id));
            }, 100);

          });

        }
      });
    }


    // Fit the map bounds to include all markers
    map.fitBounds(bounds);
  }

  editCity(cityName: string): void {
    console.log("Edit clicked for:", cityName);
    this.router.navigate(['/home/edit-city'], { queryParams: { cityName } });
  }

  deleteCity(cityName: string): void {
    this.toastr.warning("Coming soon!");
    //alert(`Deleting ${cityName}`);
  }

  isSearchActiveFrom = false;
  allTerminalsList: any;

  searchTerminal() {
    if (this.terminalName == '') {
      this.isSearchActiveFrom = false;
      return
    }

    this.isSearchActiveFrom = true;

    const formData = new URLSearchParams();
    formData.append('location', this.terminalName);

    this.service
      .postAPI('get-location', formData.toString())
      .subscribe((res: any) => {
        if (res.success == true) {
          this.allTerminalsList = res.data;
        }
      });
  };

  searchByFromCity(item: any, selectedName?: any) {
    this.terminalName = selectedName ? selectedName : item.description;
    this.isSearchActiveFrom = false;
    this.getLetLongUkrane();
  };


  isTouched: any = {
    stopName: false,
    terminalName: false
  };


  addTerminal() {
    const stopName = this.stopName?.trim();
    const terminalName = this.terminalName?.trim();

    if (!stopName || !terminalName) {
      return;
    }

    const formURlData = new URLSearchParams();
    formURlData.set('city_name', this.stopName);
    formURlData.set('city_address', this.terminalName);
    this.service.postAPI('create-city', formURlData.toString()).subscribe({
      next: (response) => {
        if (response.success) {
          //this.letLongUkrane = response.data;
          this.closeModal.nativeElement.click();
          this.toastr.success(response.message);
          //this.getAllTerminals();
          this.getAllCity()
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


  singleLine: any;
  reverseLine: any;
  copyTitle: any;
  copyDescription: any


  addRouteById(id?: any) {
    //if(this.route_id || id){
    const formURlData = new URLSearchParams();
    formURlData.set('route_id', id);
    this.service.postAPI('get-route-by-id', formURlData.toString()).subscribe({
      next: (response) => {
        if (response.success) {
          this.singleLine = response.data.route_stops.map((stop: any) => stop.stop_city.city_id);
          this.reverseLine = response.data.route_stops
            .map((stop: any) => stop.stop_city.city_id)
            .reverse();
          // console.log(this.singleLine);
          // this.copyTitle = response.data.title;
          this.copyDescription = response.data.description;
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
    // }
  }

  CopyRouteId: any;

  getCopyRouteId(route_id: any){
    this.CopyRouteId = route_id;
  }

  copyRoute() {
    const formData = new URLSearchParams();
    // formData.append('title', this.copyTitle);
    // formData.append('route_stops', this.singleLine.toString());
    // formData.append('description', this.copyDescription);
    formData.append('route_id', this.CopyRouteId)
    let url = 'create-copy-route';

    this.service
      .postAPI(url, formData.toString())
      .subscribe({
        next: res => {
          if (res.success == true) {
            this.router.navigate(['/home/routes-management'])
            //  this.allTerminalsList = res.data;
            this.toastr.success(res.message);
            this.getRoutes();
            this.isSingleLatLog = false;
            this.initMap();
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
  };

  ngOnDestroy() {
    this.CopyRouteId = '';
  }

  reverseRoute() {
    this.copyTitle = this.copyTitle?.trim(); // Trim spaces
  const trimmedTitle = this.copyTitle;

  if (!trimmedTitle) {
    this.toastr.error('Title cannot be empty');
    return;
  }
    const formData = new URLSearchParams();
    formData.append('title', trimmedTitle);
    formData.append('route_stops', this.reverseLine.toString());
    formData.append('description', this.copyDescription);

    let url = 'create-route';

    this.service
      .postAPI(url, formData.toString())
      .subscribe({
        next: res => {
          if (res.success == true) {
            this.router.navigate(['/home/routes-management'])
            //  this.allTerminalsList = res.data;
            this.toastr.success(res.message);
            this.getRoutes();
            this.isSingleLatLog = false;
            this.initMap();
            this.closeModal12.nativeElement.click();
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

  };


  // Triggered on blur to set the field as touched
  onBlur(fieldName: string): void {
    this.isTouched[fieldName] = true;
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
    debugger
    if (this.selectedOption == '1') {
      this.loading = true;
      const formURlData = new URLSearchParams();
      //formURlData.set('route_direction', `Austria to Ukraine`);
      formURlData.set('pickup_point', this.selectedAustriaCityId);
      formURlData.set('dropoff_point', this.selectedUkraneCityId);
      //formURlData.set('fixed_price', this.price);
      //formURlData.set('start_location_lat_long', `${this.letLongAustria.lat}, ${this.letLongAustria.lng}`);
      //formURlData.set('end_location_lat_long', `${this.letLongUkrane.lat}, ${this.letLongUkrane.lng}`);

      this.service.postAPI('create-route', formURlData.toString()).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.letLongUkrane = response.data;
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
    } else {
      this.loading = true;
      const formURlData = new URLSearchParams();
      //formURlData.set('route_direction', `Ukraine to Austria`);
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
