import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../../../services/shared.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoaderComponent } from '../../loader/loader.component';

@Component({
  selector: 'app-new-route',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, RouterLink, LoaderComponent],
  templateUrl: './new-route.component.html',
  styleUrl: './new-route.component.css'
})
export class NewRouteComponent {
  stopCityID = ''
  status: boolean = true;
  title: string = '';
  description: string = '';
  busStops: any[] = [
    { city_id: null, isNew: false }, // First default location
    { city_id: null, isNew: false }, // Second default location
  ];
  departureTimes: string[] = ['08:00'];
  newDepartureTime: string = '';
  route_id: any;
  loading: boolean = false;

  constructor(private service: SharedService, private toastr: NzMessageService, private activRout: ActivatedRoute, private router: Router, private cdrf: ChangeDetectorRef) { }

  ngOnInit() {
    this.activRout.queryParams.subscribe({
      next: (params) => {
        this.route_id = params['route_id'];
        if (this.route_id) {
          this.getRouteById(this.route_id)
        }
        console.log(this.route_id);
      }
    })
    this.getAllCity();
  }

  addBusStop() {
    this.busStops.push({ city_id: null, isNew: true });
  }

  addDepartureTime() {
    if (this.newDepartureTime) {
      this.departureTimes.push(this.newDepartureTime);
      this.newDepartureTime = '';
    }
  }

  editTime(time: string) {
    // Logic to edit a departure time
  }

  deleteTime(time: string) {
    this.departureTimes = this.departureTimes.filter(t => t !== time);
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.busStops, event.previousIndex, event.currentIndex);
  }


  deleteBusStop(index: number) {
    this.busStops.splice(index, 1);
  }

  // Reorder dropdowns
  reorderBusStop(currentIndex: number, newIndex: number) {
    console.log("ree");
    if (newIndex >= 0 && newIndex < this.busStops.length) {
      // Swap the current item with the target item
      const temp = this.busStops[currentIndex];
      this.busStops[currentIndex] = this.busStops[newIndex];
      this.busStops[newIndex] = temp;
    }
  }

  allCities: any;

  getAllCity() {
    //debugger
    this.service.getApi('get-all-active-city').subscribe({
      next: resp => {
        this.allCities = resp.data;

        // this.busStops.push({ city_id: null, isNew: true });
        console.log(this.allCities);
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  route_stops_length: any;

  getRouteById(id: number) {
    const formData = new URLSearchParams();
    formData.append('route_id', id.toString());
    //debugger
    this.service.postAPI('get-route-by-id', formData).subscribe({
      next: resp => {
        this.title = resp.data.title;
        this.description = resp.data.description;
        this.status = resp.data.is_active;
        //debugger
        this.route_stops_length = resp.data.route_stops?.length;
        this.busStops = resp.data.route_stops.map((item: any) => ({
          city_id: item.stop_city.city_id,
          isNew: false // Set isNew to false since these are pre-existing stops
        }));
        // this.busStops.push({ city_id: null, isNew: true });
        console.log(this.busStops);
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

  @ViewChild('closeModal44') closeModal44!: ElementRef;

  saveBusStops() {

    const title = this.title?.trim();
    const description = this.description?.trim();

    if (!title) {
      this.toastr.error('Please enter the title.');
      return;
    }

    const selectedIds = this.busStops.map((stop) => stop.city_id);
    const nullIds = selectedIds.filter(items => items == null)
    if (nullIds.length > 0) {
      this.toastr.warning('Bus stop can not be empty!')
      return
    }

    const startCountry = this.allCities.find((items: any) => items.city_id == selectedIds[0]).city_id;
    const endCountry = this.allCities.find((items: any) => items.city_id == selectedIds[selectedIds.length - 1]).city_id;

    if (startCountry == endCountry) {
      console.log("validation to be applied same country");
      return
    }
    // debugger
    // console.log(selectedIds.length);
    // return
    //const routeDirection = `${startCountry} to ${endCountry}`
    const formData = new URLSearchParams();
    //formData.append('route_direction', routeDirection.toString());
    formData.append('title', this.title.toString());
    if (selectedIds?.length != this.route_stops_length) {
      formData.append('route_stops', selectedIds.toString());
    } else {
      formData.append('route_stops', '');
    }
    if (this.description) {
      formData.append('description', this.description.toString());
    } else {
      formData.append('description', '');
    }
    if (this.route_id) {
      formData.append('route_id', this.route_id.toString());
      formData.append('is_active', this.status.toString());
    }

    let url = this.route_id == undefined ? 'create-route' : 'update-route';
    this.loading = true;
    this.service
      .postAPI(url, formData.toString())
      .subscribe({
        next: res => {
          if (res.success == true) {
            this.loading = false;
            this.router.navigate(['/home/routes-management'])
            //  this.allTerminalsList = res.data;
            this.closeModal44.nativeElement.click();
            if (this.route_id) {
              this.toastr.success(res.message);
            } else {
              this.toastr.success(res.message);
            }
          } else {
            this.loading = false;
            this.toastr.warning(res.message);
          }
        },
        error: error => {
          this.loading = false;
          if (error.error.message) {
            this.toastr.error(error.error.message);
          } else {
            this.toastr.error('Something went wrong!');
          }
        }
      });

  };


  // // Handle location change
  // onLocationChange(cityId: string, index: number) {
  //   this.busStops[index].city_id = cityId;
  //   console.log('Updated Bus Stops:', this.busStops);
  // }

  onLocationChange(cityId: string, index: number) {
    // Check if the cityId already exists in other bus stops
    //debugger
    const duplicate = this.busStops.some((stop, i) => stop.city_id == cityId && i !== index);
    console.log(duplicate)

    if (duplicate) {
      this.toastr.warning('This city is already selected. Please choose a different city.');
      this.busStops[index].city_id = null;
      setTimeout(() => {
        const locationSelect: any = document.getElementById(`location-${index}`) as HTMLSelectElement;
        if (locationSelect) {
          locationSelect.value = null;
        }
      }, 0);
    } else {
      // Update the city_id if no duplicate
      this.busStops[index].city_id = cityId;
      console.log('Updated Bus Stops:', this.busStops);
    }
  }

  ngOnDestroy() {
    this.route_id = '';
  }

  cancel() {
    this.router.navigate(['/home/routes-management'])
  }


}