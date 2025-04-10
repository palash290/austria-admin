import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../../services/shared.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.css'
})
export class BookingDetailsComponent {

  id: any;
  ticketData: any;
  passengersDetails: any;

  constructor(private apiService: SharedService, private route: ActivatedRoute, private router: Router, private toastr: NzMessageService) { }

  // ngOnInit(): void {

  //   this.route.queryParams.subscribe(params => {
  //     if (params['autoPrint'] === 'true') {
  //       setTimeout(() => {
  //         window.print();
  //       }, 1000); // Delay to ensure the content is fully loaded
  //     }
  //   });

  //   this.route.queryParams.subscribe(params => {
  //     this.id = params['booking_id'];
  //     console.log('this.id', this.id);
  //     this.getTicketDetails(this.id);
  //   });
  // }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.id = params['booking_id'];
      console.log('this.id', this.id);
      this.getTicketDetails(this.id);

      if (params['autoPrint'] === 'true') {
        setTimeout(() => {
          window.print();
        }, 1000); // Ensures the content is loaded before printing
      }
    });
  }

  isUkrane!: boolean;

  getTicketDetails(id: any) {
    this.apiService.getApi(`get-ticket-booking-by-booking-id?id=${id}`).subscribe({
      next: (resp: any) => {
        this.ticketData = resp.data[0];
        this.passengersDetails = resp.data[0].passengers;
        this.isUkrane = resp.data[0].from.from_ukraine;
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  downloadPDF(): void {
    const element = document.getElementById('pdfContent');
    if (!element) {
      console.error('Element not found!');
      return;
    }

    html2canvas(element, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 190; // Fit to A4 width (210mm with margins)
      const pageHeight = 297; // A4 page height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Scale height accordingly

      let yPosition = 10;
      let pageCanvasHeight = pageHeight - 20; // Leave some margin
      let remainingHeight = imgHeight;

      let startY = 0; // Start position for cropping
      let page = 0;

      while (remainingHeight > 0) {
        let cropHeight = Math.min(remainingHeight, pageCanvasHeight);

        // Create a new canvas to hold the cropped section
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = (cropHeight * canvas.width) / imgWidth;

        const pageCtx = pageCanvas.getContext('2d');
        if (pageCtx) {
          pageCtx.drawImage(
            canvas,
            0,
            startY, // Start position in original canvas
            canvas.width,
            pageCanvas.height, // Crop height in original canvas
            0,
            0,
            pageCanvas.width,
            pageCanvas.height
          );

          const pageImgData = pageCanvas.toDataURL('image/png');

          if (page > 0) pdf.addPage(); // Add a new page after the first one
          pdf.addImage(pageImgData, 'PNG', 10, yPosition, imgWidth, cropHeight);

          startY += pageCanvas.height;
          remainingHeight -= cropHeight;
          page++;
        }
      }
      pdf.save('ticket.pdf');
    });
  }


}
