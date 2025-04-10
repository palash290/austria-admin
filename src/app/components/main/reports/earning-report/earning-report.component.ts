import { Component, Input } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedService } from '../../../../services/shared.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../loader/loader.component';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-earning-report',
  standalone: true,
  imports: [NgApexchartsModule, FormsModule, CommonModule, LoaderComponent],
  templateUrl: './earning-report.component.html',
  styleUrl: './earning-report.component.css'
})
export class EarningReportComponent {

  public eraningChart!: any;
  public statusChart!: any;
  latestBooking: any;
  loader: boolean = false;
  filterQuery: any = 'day';
  boxData: any;
  loading: boolean = false;

  constructor(private service: SharedService, private toastr: NzMessageService) { }

  //ngAfterViewInit() {
  // this.statusChart = {
  //   series: [44, 55, 41, 17, 15],
  //   chart: {
  //     width: 380,
  //     type: "donut"
  //   },
  //   dataLabels: {
  //     enabled: false
  //   },
  //   fill: {
  //     type: "gradient"
  //   },
  //   legend: {
  //     formatter: function (val: string, opts: { w: { globals: { series: { [x: string]: string; }; }; }; seriesIndex: string | number; }) {
  //       return val + " - " + opts.w.globals.series[opts.seriesIndex];
  //     }
  //   },
  //   responsive: [
  //     {
  //       breakpoint: 480,
  //       options: {
  //         chart: {
  //           width: 200
  //         },
  //         legend: {
  //           position: "bottom"
  //         }
  //       }
  //     }
  //   ]
  // };


  // this.getReportData();

  //}


  @Input() set earningTabActivated(value: boolean) { }



  ngAfterViewInit() {
    const tabTrigger = document.querySelector('#earning-tab');
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

  bookingVal: any;


  getReportData() {
    this.loading = true;
    const formURLData = new URLSearchParams();
    formURLData.set('report_date', this.filterQuery);

    this.service.postAPI('earning-report', formURLData.toString()).subscribe({
      next: resp => {
        if (resp.success == true) {
          this.loading = false;
          this.loader = true;

          this.bookingVal = Object.keys(resp.data.earningOverview || {}).length;

          this.boxData = resp.data.bookingReportForAHeader
          this.latestBooking = resp.data.booking;

          setTimeout(() => {
            if (this.filterQuery === 'day') {
              // Extract ticket revenues dynamically
              // const ticketTypes = resp.data.earningOverview.map((item: { ticket_type: string; total_revenue: string }) => ({
              //   type: item.ticket_type,
              //   revenue: parseFloat(item.total_revenue)
              // }));
              const totalPassengersPerBooking = [{ day: 'Today', bookings: resp.data.earningOverview.total_earning }];
              this.eraningChart = {
                series: [
                  {
                    name: "Earning",
                    data: totalPassengersPerBooking.map((item: { bookings: any; }) => item.bookings)
                  }
                ],
                chart: {
                  height: 350,
                  type: "bar"
                },
                labels: totalPassengersPerBooking.map((item: { day: any; }) => item.day),
                title: {
                  align: "left"
                },
                colors: ["#FF4560", "#008FFB", "#00E396", "#FEB019", "#775DD0"],
                legend: {
                  position: "bottom"
                }
              };
            } else if (this.filterQuery === 'week') {
              // const ticketTypes = resp.data.earningOverview.map((item: { ticket_type: string; total_revenue: string }) => ({
              //   type: item.ticket_type,
              //   revenue: parseFloat(item.total_revenue)
              // }));

              // const totalBookingsPerWeek = Object.entries(resp.data.earningOverview).map(([day, value]) => ({
              //   day,
              //   bookings: value
              // }));


              // this.eraningChart = {
              //   series: totalBookingsPerWeek.map((item: { bookings: any; }) => item.bookings),
              //   chart: {
              //     height: 350,
              //     type: "donut"
              //   },
              //   //labels: totalBookingsPerWeek.map((item: { day: any; }) => item.day),
              //   title: {
              //     align: "left"
              //   },
              //   xaxis: {
              //     categories: totalBookingsPerWeek.map((item: { day: any; }) => item.day)
              //   },
              //   colors: ["#FF4560", "#008FFB", "#00E396", "#FEB019", "#775DD0"],
              //   legend: {
              //     position: "bottom"
              //   }
              // };
              const totalBookingsPerWeek = Object.entries(resp.data.earningOverview).map(([day, value]) => ({
                day,
                bookings: value
              }));

              this.eraningChart = {
                series: [{
                  name: "Earning",
                  data: totalBookingsPerWeek.map(item => item.bookings)
                }],
                chart: {
                  height: 350,
                  type: "bar"
                },
                title: {
                  text: "Earnings Overview",
                  align: "left"
                },
                xaxis: {
                  categories: totalBookingsPerWeek.map(item => item.day)
                },
                colors: ["#008FFB"],
                legend: {
                  position: "bottom"
                }
              };

            } else if (this.filterQuery === 'year') {
              // Extract ticket revenues dynamically
              // const ticketTypes = resp.data.earningOverview.map((item: { ticket_type: string; total_revenue: string }) => ({
              //   type: item.ticket_type,
              //   revenue: parseFloat(item.total_revenue)
              // }));

              const totalBookingsPerMonth = Object.entries(resp.data.earningOverview).map(([month, value]) => ({
                month,
                bookings: value
              }));

              this.eraningChart = {
                series: [{
                  name: "Earning",
                  data: totalBookingsPerMonth.map(item => item.bookings)
                }],
                chart: {
                  height: 350,
                  type: "bar"
                },
                title: {
                  text: "Monthly Earnings Overview",
                  align: "left"
                },
                xaxis: {
                  categories: totalBookingsPerMonth.map(item => item.month)
                },
                colors: ["#008FFB"],
                legend: {
                  position: "bottom"
                }
              };

            }
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




  filterQueryTicket: any = 'day';
  statusLength: any;

  ticketGraph() {

    const formURLData = new URLSearchParams();
    formURLData.set('report_date', this.filterQueryTicket.toLowerCase());

    this.service.postAPI('earning-ticket-type-report', formURLData.toString()).subscribe({
      next: resp => {

        this.statusLength = resp.data?.length;

        //debugger
        const series = resp.data?.map((ticket: any) => ticket.total_earning);
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


}
