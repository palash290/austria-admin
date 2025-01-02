import { Component, ElementRef, ViewChild } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink,
    CommonModule,],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  @ViewChild('closeModal') closeModal!: ElementRef;
  
  constructor(private apiService: SharedService) { }


  logout(): void {
    this.apiService.logout(); // Clear the token (e.g., from localStorage or API)
    this.closeModal.nativeElement.click();
  }


}
