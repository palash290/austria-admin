import { Component } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { RouterLink } from '@angular/router';

export type ChartOptions = {
  series?: ApexAxisChartSeries;
  chart?: ApexChart;
  xaxis: ApexXAxis;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  buses: any;
  //public eraningChart!: any;
  public bookingChart!: any;
  public statusChart!: any;

  totalBookingsPerMonth: any;
  todayBuses: any;
  latestBooking: any;
  allBookings: any;

  bookingStatusInAGraph: any;

  constructor(private service: SharedService) { }

  ngOnInit() {

    // this.eraningChart = {
    //   series: [
    //     {
    //       name: "Progress",
    //       data: [56, 82, 59, 44, 67, 87, 100],
    //     },
    //   ],
    //   chart: {
    //     type: "bar",
    //     height: 350,
    //   },
    //   plotOptions: {
    //     bar: {
    //       columnWidth: "30%",
    //       borderRadius: 10,
    //       distributed: true,
    //     },
    //   },
    //   grid: {
    //     row: {
    //       colors: ["#f3f3f3", "transparent"],
    //       opacity: 0.5
    //     }
    //   },
    //   dataLabels: {
    //     enabled: true,
    //     formatter: (val: any) => `${val}%`,
    //   },
    //   xaxis: {
    //     categories: ["M", "T", "W", "T", "F", "S", "S"],
    //   },
    //   fill: {
    //     type: "gradient",
    //     gradient: {
    //       shadeIntensity: 0.5,
    //       inverseColors: false,
    //       opacityFrom: 0.8,
    //       opacityTo: 1,
    //       stops: [0, 100],
    //     },
    //   },
    //   title: {
    //     text: "Total Earnings",
    //     align: "left"
    //   },
    //   tooltip: {
    //     enabled: true,
    //     y: {
    //       formatter: (val: any) => `${val}%`,
    //     },
    //   },
    // };

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

    this.getBuses();
  }

  // userCount: any;
  // busCount: any;
  // driverCount: any;
  // routeCount: any;
  totalBookings: any;

  getBuses() {
    this.service.getApi('dashboard-details').subscribe({
      next: resp => {

        this.totalBookingsPerMonth = resp.data.totalBookingsPerMonth;

        this.todayBuses = resp.data.todayBuses;

        this.bookingChart = {
          series: [
            {
              name: "Total Bookings",
              data: this.totalBookingsPerMonth.map((item: { totalBookings: any; }) => item.totalBookings)
            }
          ],
          chart: {
            height: 280,
            type: "line",
            zoom: {
              enabled: false
            }
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            curve: "straight"
          },
          title: {
            text: "Total Bookings",
            align: "left"
          },
          grid: {
            row: {
              colors: ["#f3f3f3", "transparent"],
              opacity: 0.5
            }
          },
          xaxis: {
            categories: this.totalBookingsPerMonth.map((item: { month: any; }) => item.month)
          }
        };

        this.latestBooking = resp.data.latestBooking;
        this.allBookings = resp.data.allBookings;

        this.bookingStatusInAGraph = resp.data.bookingStatusInAGraph;

        this.totalBookings = this.bookingStatusInAGraph.Confirmed + this.bookingStatusInAGraph.Pending + this.bookingStatusInAGraph.Cancelled;

        const labels = Object.keys(this.bookingStatusInAGraph);
        const series = Object.values(this.bookingStatusInAGraph);

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
            formatter: function (val: string, opts: { w: { globals: { series: { [x: string]: string; }; }; }; seriesIndex: string | number; }) {
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

        // this.userCount = resp.data.userCount;
        // this.busCount = resp.data.busCount;
        // this.driverCount = resp.data.bookingCount;
        // this.routeCount = resp.data.routeCount;

        // if (resp.success && resp.data.userList) {
        //   this.buses = resp.data.userList
        //   console.log('Buses:', this.buses);
        // } else {
        //   console.log('No bus data available');
        // }
      },
      error: error => {
        console.log(error.message);
      }
    });
  }


}
