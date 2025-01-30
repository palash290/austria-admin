import { Component } from '@angular/core';
import { SharedService } from '../../../../services/shared.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
declare var google: any;

@Component({
  selector: 'app-edit-city',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './edit-city.component.html',
  styleUrl: './edit-city.component.css'
})
export class EditCityComponent {

  map!: google.maps.Map;
  marker!: google.maps.Marker;
  city_id: any;
  busStopForm!: FormGroup;

  constructor(private fb: FormBuilder, private service: SharedService, private toastr: NzMessageService, private router: Router, private activRout: ActivatedRoute) { }

  ngOnInit() {
    this.activRout.queryParams.subscribe({
      next: (params) => {
        this.city_id = params['cityName'];
        if (this.city_id) {
          this.addRouteById(this.city_id)
        }
        console.log(this.city_id);
      }
    })
    this.initMap();
    this.initForm();
  }

  initForm() {
    this.busStopForm = this.fb.group({
      busStop: ['', Validators.required],
      description: ['', Validators.required],
      fromUkraine: [],
      status: [],
      //address: [''],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required]
    });
  }

  initMap(): void {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB0V1g5YyGB_NE1Lw1QitZZGECA5-1Xnng`;
    script.onload = () => this.createMap();
    document.body.appendChild(script);
  }

  createMap(): void {
    const defaultLocation = {
      lat: parseFloat(this.busStopForm.value.latitude),
      lng: parseFloat(this.busStopForm.value.longitude)
    };

    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      zoom: 10,
      center: defaultLocation
    });

    this.marker = new google.maps.Marker({
      position: defaultLocation,
      map: this.map,
      draggable: true,
      title: "Drag me!"
    });

    // Update form fields when the marker is moved
    this.marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        this.busStopForm.patchValue({
          latitude: event.latLng.lat().toString(),
          longitude: event.latLng.lng().toString()
        });
      }
    });
  }


  addRouteById(id?: any) {
    //if(this.route_id || id){
    this.service.getApi(`get-city-by-id?city_id=${15}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.busStopForm.patchValue({
            busStop: response.data.city_name,
            description: response.data.city_description,
            fromUkraine: response.data.from_ukraine,
            status: response.data.is_active,
            //address: response.data.city_address,
            latitude: response.data.latitude,
            longitude: response.data.longitude,
          });
          this.terminalName = response.data.city_address;
          this.initMap();
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

  onSubmit() {
    this.busStopForm.markAllAsTouched();
    if (!this.busStopForm.valid) {
      return
    }

    const busStop = this.busStopForm.value.busStop?.trim();
    const description = this.busStopForm.value.description?.trim();
    const terminalName = this.busStopForm.value.terminalName?.trim();
    const latitude = this.busStopForm.value.latitude?.trim();
    const longitude = this.busStopForm.value.longitude?.trim();

    if (!busStop || !description || !terminalName || !latitude || !longitude) {
      return;
    }

    console.log('Form Submitted:', this.busStopForm.value);
    const formURlData = new FormData();
    formURlData.set('city_name', this.busStopForm.value.busStop);
    formURlData.set('city_id', this.city_id);
    formURlData.set('city_description', this.busStopForm.value.description);
    formURlData.set('city_address', this.terminalName);
    formURlData.set('latitude', this.busStopForm.value.latitude);
    formURlData.set('longitude', this.busStopForm.value.longitude);
    formURlData.set('from_ukraine', this.busStopForm.value.fromUkraine);
    formURlData.set('is_active', this.busStopForm.value.status);

    this.service.postAPIFormData('update-city', formURlData).subscribe(
      response => {
        if (response.success === true) {
          this.toastr.success(response.message);
        } else {
          this.toastr.warning(response.message);
        }
      },
      error => {
        if (error.error.message) {
          this.toastr.error(error.error.message);
        } else {
          this.toastr.error('Something went wrong!');
        }
      }
    );

  }

  isSearchActiveFrom = false;
  allTerminalsList: any;
  terminalName: any;

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

  isTouched: boolean = false;

  onBlur() {
    this.isTouched = true;
  }

  searchByFromCity(item: any, selectedName?: any) {
    this.terminalName = selectedName ? selectedName : item.description;
    this.isSearchActiveFrom = false;
    this.getLetLongUkrane();
  };


  letLongUkrane: any;

  getLetLongUkrane() {
    if (this.terminalName) {
      const formURlData = new URLSearchParams();
      formURlData.set('address', `${this.terminalName}`);

      this.service.postAPI('get-lat-long', formURlData.toString()).subscribe(response => {
        if (response.success) {
          //debugger
          this.letLongUkrane = response.data;
          this.busStopForm.patchValue({
            latitude: this.letLongUkrane.lat,
            longitude: this.letLongUkrane.lng
          });
          this.initMap();
        }
      });
    }
  }


}



