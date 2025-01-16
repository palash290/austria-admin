import { Component, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-terminal-management',
  standalone: true,
  imports: [HeaderComponent, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './terminal-management.component.html',
  styleUrl: './terminal-management.component.css'
})
export class TerminalManagementComponent {

  totalPagesArray: number[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  pageSizeOptions = [5, 10, 25, 50];
  searchQuery: any = '';
  allTerminals: any;
  allRoutes: any;
  terminalName: any;

  constructor(private service: SharedService, private toastr: ToastrService) { }

  ngOnInit() {
    this.getAllTerminals();
    this.getAllCity();
  }

  getAllTerminals() {
    this.service.getApi(`get-all-city-terminal?page=${this.currentPage}&limit=${this.pageSize}&search=${this.searchQuery}`).subscribe({
      next: resp => {
        this.allTerminals = resp.data.terminals;
        this.totalPages = resp.data.pagination?.totalPages
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  getAllCity() {
    this.service.getApi('get-all-city').subscribe({
      next: resp => {
        this.allRoutes = resp.data;
      },
      error: error => {
        console.log(error.message);
      }
    });
  }


  selectedCityId: any = '1';
  selectedCityName: any;

  onAustriaCityChange(event: any): void {
    const selectedId = event.target.value;
    const selectedCategory = this.allRoutes.find((language: any) => language.city_id == selectedId);

    if (selectedCategory) {
      this.selectedCityId = selectedId;
      this.selectedCityName = selectedCategory.city_name;
      this.getAllCity();
      console.log('Selected austriaCityId ID:', this.selectedCityId);
      console.log('Selected austriaCity name:', this.selectedCityName);
      //this.getQuestions(this.languageId)
    }
  }

  @ViewChild('closeModal') closeModal!: ElementRef;

  addTerminal() {
    const formURlData = new URLSearchParams();
    formURlData.set('city_id', this.selectedCityId);
    formURlData.set('terminal_name', this.terminalName);
    formURlData.set('latitude', this.letLongUkrane.lat);
    formURlData.set('longitude', this.letLongUkrane.lng);
    this.service.postAPI('create-city-terminal', formURlData.toString()).subscribe({
      next: (response) => {
        if (response.success) {
          //this.letLongUkrane = response.data;
          this.closeModal.nativeElement.click();
          this.toastr.success(response.message);
          this.getAllTerminals();
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

  letLongUkrane: any;

  getLetLongUkrane() {
    if (this.selectedCityId) {
      const formURlData = new URLSearchParams();
      formURlData.set('address', `${this.terminalName}`);

      this.service.postAPI('get-lat-long', formURlData.toString()).subscribe(response => {
        if (response.success) {
          this.letLongUkrane = response.data;
        }
      });
    }
  }

  updateDet: any;
  updateId: any;

  patchUpdate(details: any) {
    this.updateDet = details;
    this.updateId = details.terminal_id;
  }

  @ViewChild('closeModal21') closeModal21!: ElementRef;

  deleteTerminal() {
    const formURlData = new URLSearchParams();
    formURlData.set('terminal_id', this.updateId);
    //this.btnDelLoader = true;
    this.service.postAPI(`delete-city-terminal-id`, formURlData.toString()).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.closeModal21.nativeElement.click();
          this.toastr.success(resp.message)
          this.getAllTerminals();
          //this.btnDelLoader = false;
        } else {
          //this.btnDelLoader = false;
          this.toastr.warning('Something went wrong!');
          this.getAllTerminals();
        }
      },
    });
  }

  isTouched: boolean = false;
  onBlur() {
    this.isTouched = true;
  }
  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.getAllTerminals();
  }

  changePageSize(newPageSize: number) {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.getAllTerminals();
  }
}
// "data": [
//         {
//             "terminal_id": 2,
//             "terminal_name": "Innsbruck Südbahnstraße, Innsbruck, UA",
//             "latitude": "47.2583620",
//             "longitude": "11.3998576",
//             "created_at": "2025-01-13T09:34:13.588Z",
//             "updated_at": "2025-01-13T09:34:13.588Z",
//             "city": {
//                 "city_id": 15,
//                 "country_name": "Ukraine",
//                 "city_name": "Kyiv",
//                 "latitude": "50.4503596",
//                 "longitude": "30.5245025",
//                 "is_active": true,
//                 "created_at": "2025-01-07T08:10:33.046Z",
//                 "updated_at": "2025-01-07T08:18:39.000Z"
//             }
//         },
//         {