import { Component, Input } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedService } from '../../../../services/shared.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-report',
  standalone: true,
  imports: [NgApexchartsModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-report.component.html',
  styleUrl: './user-report.component.css'
})
export class UserReportComponent {

  public statusChart!: any;
  latestBooking: any;
  loader: boolean = false;
  filterQuery: any = '';
  boxData: any;
  loading: boolean = false;
  recentTravel: any;

  constructor(private service: SharedService, private toastr: NzMessageService) { }

  @Input() set earningTabActivated(value: boolean) { }

  ngAfterViewInit() {

    const tabTrigger = document.querySelector('#user-tab');
    if (tabTrigger) {
      tabTrigger.addEventListener('shown.bs.tab', () => {
        // Dispatch an event or call a method to re-render the chart
        this.earningTabActivated = true;
        this.getReportData();
        this.getUsers();

      });
    }
  }

  ngOnInit() {
  }


  getReportData() {
    this.loading = true;

    this.service.getApi('user-report').subscribe({
      next: resp => {
        if (resp.success == true) {
          this.loading = false;
          this.loader = true;

          this.recentTravel = resp.data.sortedUsers;

          const guestUsers = resp.data?.guestUsersCount || 0;
          const registeredUsers = resp.data?.registeredUsersCount || 0;

          setTimeout(() => {

            this.statusChart = {
              series: [guestUsers, registeredUsers],
              chart: {
                width: 380,
                type: "donut"
              },
              labels: ["Guest Users", "Registered Users"],
              dataLabels: {
                enabled: true,
                formatter: function (val: number, opts: any) {
                  const count = opts.w.config.series[opts.seriesIndex];
                  return count.toString(); // Show actual count instead of percentage
                }
              },
              fill: {
                type: "gradient"
              },
              legend: {
                formatter: function (
                  val: string,
                  opts: { w: { globals: { series: number[] } }; seriesIndex: number }
                ) {
                  return val + " - " + opts.w.globals.series[opts.seriesIndex];
                }
              },
              responsive: [
                {
                  breakpoint: 480,
                  options: {
                    chart: {
                      width: 200
                    },
                    legend: {
                      position: "bottom"
                    }
                  }
                }
              ]
            };

          }, 1000);

        } else {
          this.loading = false;
        }


      },
      error: error => {
        if (error.error.message) {
          this.loading = false;
          this.toastr.error(error.error.message);
        } else {
          this.loading = false;
          this.toastr.error('Something went wrong!');
        }
      }
    });
  }


  userData: any;
  currentPage: number = 1;
  pageSize: number = 5;
  searchQuery: any = '';
  totalPages: number = 1;
  startDate: any = '';
  endDate: any = '';
  pageSizeOptions = [5, 10, 25, 50];

  getUsers() {
    this.service.getApi(`user-list?page=${this.currentPage}&limit=${this.pageSize}&search=${this.searchQuery}&filter=${this.filterQuery}&startDate=${this.startDate}&endDate=${this.endDate}`).subscribe({
      next: resp => {
        this.userData = resp.data.users;
        this.totalPages = resp.data.pagination?.totalPages;
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  reset() {
    this.startDate = '';
    this.endDate = '';
    this.getUsers();
  }


  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.getUsers();
  }

  changePageSize(newPageSize: number) {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.getUsers();
  }


}
