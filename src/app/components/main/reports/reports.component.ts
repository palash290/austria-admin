import { Component, Input } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { EarningReportComponent } from './earning-report/earning-report.component';
import { UserReportComponent } from './user-report/user-report.component';
import { SharedService } from '../../../services/shared.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [EarningReportComponent, UserReportComponent, NgApexchartsModule, FormsModule, RouterLink, CommonModule, LoaderComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
  providers: [EarningReportComponent]
})
export class ReportsComponent {

  public bookingChart!: any;
  public statusChart!: any;
  latestBooking: any;

  filterQuery: any = 'Day';
  filterQueryTicket: any = 'day';
  loading: boolean = false;

  constructor(private service: SharedService, private test: EarningReportComponent, private toastr: NzMessageService) { }

  ngOnInit() {

    // this.bookingChart = {
    //   series: [],
    //   chart: { type: "line", height: 350 },
    //   xaxis: { categories: [] },
    //   colors: ["#008FFB"]
    // };

    this.getReportData();
    this.ticketGraph();
  }

  @Input() set earningTabActivated(value: boolean) { }

  ngAfterViewInit() {
    const tabTrigger = document.querySelector('#home-tab');
    if (tabTrigger) {
      tabTrigger.addEventListener('shown.bs.tab', () => {
        // Dispatch an event or call a method to re-render the chart
        this.earningTabActivated = true; // use an @Input() or Subject to notify child
        this.getReportData();
        this.ticketGraph();
      });
    }
  }


  totalPassengersPerBooking: any;
  totalBookingsPerWeek: any;
  totalBookingsPerMonth: any;

  boxData: any;
  bookingVal: any;

  getReportData() {
    this.loading = true;
    const formURLData = new URLSearchParams();
    formURLData.set('report_date', this.filterQuery.toLowerCase());

    this.service.postAPI('booking-report', formURLData.toString()).subscribe({
      next: resp => {
        if (resp.success == true) {
          this.loading = false;
          this.boxData = resp.data.bookingReportForAHeader;
          this.latestBooking = resp.data.booking;

          this.bookingVal = Object.keys(resp.data.bookingOverview || {}).length;

          //this.ticketGraph(resp.data.ticketCounts)

          if (this.filterQuery === 'Year') {
            this.totalBookingsPerMonth = Object.entries(resp.data.bookingOverview).map(([month, value]) => ({
              month,
              bookings: value
            }));

            this.bookingChart = {
              series: [
                {
                  name: "Bookings",
                  data: this.totalBookingsPerMonth.map((item: { bookings: any; }) => item.bookings)
                }
              ],
              chart: {
                height: 350,
                type: "line"
              },
              title: {
                //text: "Yearly Booking Overview",
                align: "left"
              },
              xaxis: {
                categories: this.totalBookingsPerMonth.map((item: { month: any; }) => item.month)
              },
              colors: ["#008FFB"]
            };

          } else if (this.filterQuery == 'Week') {

            this.totalBookingsPerWeek = Object.entries(resp.data.bookingOverview).map(([day, value]) => ({
              day,
              bookings: value
            }));

            this.bookingChart = {
              series: [
                {
                  name: "Bookings",
                  data: this.totalBookingsPerWeek.map((item: { bookings: any; }) => item.bookings)
                }
              ],
              chart: {
                height: 350,
                type: "line"
              },
              title: {
                // text: "Weekly Booking Overview",
                align: "left"
              },
              xaxis: {
                categories: this.totalBookingsPerWeek.map((item: { day: any; }) => item.day)
              },
              colors: ["#00E396"]
            };

          } else if (this.filterQuery === 'Day') {
            // Since bookingOverview is a single number, store it directly
            this.totalPassengersPerBooking = [{ day: 'Today', bookings: resp.data.bookingOverview }];

            this.bookingChart = {
              series: [
                {
                  name: "Bookings",
                  data: this.totalPassengersPerBooking.map((item: { bookings: any; }) => item.bookings)
                }
              ],
              chart: {
                height: 350,
                type: "bar"
              },
              labels: this.totalPassengersPerBooking.map((item: { day: any; }) => item.day),
              title: {
                align: "left"
              },
              colors: ["#FF4560", "#FEB019", "#775DD0", "#4CAF50"]
            };
          }
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

  statusLength: any;

  ticketGraph() {

    const formURLData = new URLSearchParams();
    formURLData.set('report_date', this.filterQueryTicket.toLowerCase());

    this.service.postAPI('booking-ticket-type-report', formURLData.toString()).subscribe({
      next: resp => {

        this.statusLength = resp.data?.length;

        const series = resp.data?.map((ticket: any) => Number(ticket.count));
        const labels = resp.data?.map((ticket: any) => ticket.ticket_type);

        this.statusChart = {
          series: series,
          chart: {
            width: 380,
            type: "donut"
          },
          labels: labels,
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



  // getReportData() {
  //   const formURlData = new URLSearchParams();
  //   formURlData.set('report_date', 'week');
  //   this.service.postAPI('booking-report', formURlData.toString()).subscribe({
  //     next: resp => {

  //       this.totalBookingsPerMonth = resp.data.booking;

  //       this.bookingChart = {
  //         series: [
  //           {
  //             name: "Desktops",
  //             data: this.totalBookingsPerMonth.map((item: { passengers: any; }) => item.passengers)
  //           }
  //         ],
  //         chart: {
  //           height: 350,
  //           type: "line",
  //           zoom: {
  //             enabled: false
  //           }
  //         },
  //         dataLabels: {
  //           enabled: false
  //         },
  //         stroke: {
  //           curve: "straight"
  //         },
  //         title: {
  //           text: "Total Bookings",
  //           align: "left"
  //         },
  //         grid: {
  //           row: {
  //             colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
  //             opacity: 0.5
  //           }
  //         },
  //         xaxis: {
  //           categories: [
  //             "Jan",
  //             "Feb",
  //             "Mar",
  //             "Apr",
  //             "May",
  //             "Jun",
  //             "Jul",
  //             "Aug",
  //             "Sep"
  //           ]
  //         }
  //       };

  //     },
  //     error: error => {
  //       console.log(error.message);
  //     }
  //   });
  // }


}
