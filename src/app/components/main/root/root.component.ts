import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SidebarComponent, RouterOutlet, HeaderComponent, CommonModule],
  templateUrl: './root.component.html',
  styleUrl: './root.component.css'
})
export class RootComponent {

  isMenuActive = false;

  openMenu(isMenuActive: any) {
    this.isMenuActive = isMenuActive; // Update menu active state
  }

  closeMenu(isMenuActive: any) {
    this.isMenuActive = isMenuActive; // Update menu active state
  }

}
