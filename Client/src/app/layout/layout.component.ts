import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, BsDropdownModule, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  supportEmail: string = "admin@RxHomeoPro.com";
  supportPhone: string = "0333-4557649";
  currentYear: number = new Date().getFullYear();
  accountService = inject(AccountService);
  private router = inject(Router);
  currentRoute: string = '';

  activeSection = signal<string>('home');

  setActiveSection(section: string): void {
    this.activeSection.set(section);
  }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
      }
    });
  }
  
  logout(){
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }

  scrollToTop(event: Event): void {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}