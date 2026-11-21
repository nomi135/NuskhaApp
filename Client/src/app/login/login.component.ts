import { AfterViewInit, Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_services/account.service';
import { GoogleAuthService, GoogleCredential } from '../_services/google-auth.service';
import { PractitionerService } from '../_services/practitioner.service';
import { TextInputComponent } from '../_forms/text-input/text-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TextInputComponent, NgxSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('googleButton') googleButton!: ElementRef<HTMLElement>;

  accountService = inject(AccountService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private spinnerService = inject(NgxSpinnerService);
  private destroyRef = inject(DestroyRef);
  private toastr = inject(ToastrService);
  private googleAuth = inject(GoogleAuthService);
  private practitionerService = inject(PractitionerService);
  private readonly googleSpinnerName = 'login-spinner';

  loginForm: FormGroup = new FormGroup({});
  showAdminForm = false;

  ngOnInit(): void {
    if (this.accountService.currentUser()) {
      // Already logged in, bounce back to home
      this.router.navigateByUrl('/');
    }
    this.initializeForm();

    // Fires each time the user completes Google sign-in on this page
    this.googleAuth.credential$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(credential => this.practitionerLogin(credential));
  }

  ngAfterViewInit(): void {
    this.googleAuth
      .renderButton(this.googleButton.nativeElement, 'signin_with', 280)
      .catch(err => this.toastr.error(err?.message ?? 'Could not load Google sign-in. Please try again.'));
  }

  initializeForm() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required]],
    });
  }

  toggleAdminForm() {
    this.showAdminForm = !this.showAdminForm;
  }

  // ===== Practitioner login (Google) =====
  private practitionerLogin(credential: GoogleCredential) {
    this.spinnerService.show(this.googleSpinnerName);

    this.practitionerService.login(credential.idToken).subscribe({
      next: auth => {
        this.spinnerService.hide(this.googleSpinnerName);
        this.accountService.setPractitionerSession(auth);
        this.router.navigateByUrl('/');
      },
      error: () => {
        // Error is already handled by the HTTP interceptor
        this.spinnerService.hide(this.googleSpinnerName);
      }
    });
  }

  // ===== Admin login (unchanged) =====
  login(){
    this.spinnerService.show(undefined, {
      type: 'line-scale-party',
      bdColor: 'rgba(2555,2555,255,0)',
      color: '#333333'
    });
    const loginData: any = this.loginForm.value;
     this.accountService.login(loginData).subscribe({
       next: _ => {
        this.spinnerService.hide();
         this.router.navigateByUrl('');
       },
       error: (error: any) => { 
        this.spinnerService.hide();
        // Error is already handled by the HTTP interceptor 
        }
     })
   }
}