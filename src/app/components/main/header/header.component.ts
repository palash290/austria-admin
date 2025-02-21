import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
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
  name: any;
  
  constructor(private apiService: SharedService) { }

  ngOnInit() {
    this.apiService.refreshSidebar$.subscribe(() => {
      this.loadUserProfile();
    });
    this.loadUserProfile();
  }

  @Output() toggleEvent = new EventEmitter<boolean>();

  toggleMenu() {
    this.toggleEvent.emit(true);
  }

  loadUserProfile() {
    this.apiService.getApi('profile').subscribe({
      next: (resp) => {
        this.name = resp.data.name;
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  logout(): void {
    this.apiService.logout(); // Clear the token (e.g., from localStorage or API)
    this.closeModal.nativeElement.click();
  }


}
