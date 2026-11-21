import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { GENDER_OPTIONS } from '../_models/practitioner';
import { Country } from '../_models/country';
import { AccountService } from '../_services/account.service';
import { CountryService } from '../_services/country.service';
import { GoogleAuthService, GoogleCredential } from '../_services/google-auth.service';
import { PractitionerService } from '../_services/practitioner.service';
import { RecaptchaService } from '../_services/recaptcha.service';
import { TextInputComponent } from '../_forms/text-input/text-input.component';

@Component({
  selector: 'app-practitioner-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgxSpinnerModule, TextInputComponent],
  templateUrl: './practitioner-signup.component.html',
  styleUrl: './practitioner-signup.component.scss'
})
export class PractitionerSignupComponent implements OnInit, AfterViewInit {
  @ViewChild('googleButton') googleButton!: ElementRef<HTMLElement>;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private toastr = inject(ToastrService);
  private spinnerService = inject(NgxSpinnerService);
  private accountService = inject(AccountService);
  private countryService = inject(CountryService);
  private googleAuth = inject(GoogleAuthService);
  private practitionerService = inject(PractitionerService);
  private recaptcha = inject(RecaptchaService);
  private readonly spinnerName = 'signup-spinner';

  // Mirrors the API's rules (PractitionerSignupDto and picture validation)
  private readonly whatsAppPattern = /^\+[1-9]\d{7,14}$/;
  private readonly allowedPictureTypes = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly maxPictureBytes = 5 * 1024 * 1024;

  readonly genderOptions = GENDER_OPTIONS;

  signupForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    gender: ['', Validators.required],
    qualification: ['', Validators.maxLength(500)],
    countryId: [null as number | null, Validators.required],
    city: ['', Validators.maxLength(100)],
    whatsAppNumber: ['', [Validators.required, Validators.pattern(this.whatsAppPattern)]]
  });

  countries: Country[] = [];
  googleCredential: GoogleCredential | null = null;

  picture: File | null = null;
  picturePreview: string | null = null;
  pictureError: string | null = null;

  submitted = false;
  isSubmitting = false;

  ngOnInit(): void {
    // Already signed in? Nothing to do here.
    if (this.accountService.currentUser()) {
      this.router.navigateByUrl('/');
      return;
    }

    this.loadCountries();
    this.recaptcha.preload().catch(() => { /* surfaced again if it still fails at submit */ });

    this.googleAuth.credential$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(credential => this.onGoogleCredential(credential));
  }

  ngAfterViewInit(): void {
    this.googleAuth
      .renderButton(this.googleButton.nativeElement, 'signup_with', 280)
      .catch(err => this.toastr.error(this.errorMessage(err)));
  }

  // ===== Google =====
  private onGoogleCredential(credential: GoogleCredential): void {
    this.googleCredential = credential;

    // Prefill the name from Google, but never overwrite something the user typed
    const nameControl = this.signupForm.get('name');
    if (nameControl && !nameControl.value && credential.name) {
      nameControl.setValue(credential.name.slice(0, 100));
    }
  }

  useDifferentAccount(): void {
    this.googleCredential = null;
  }

  // ===== Countries =====
  private loadCountries(): void {
    this.spinnerService.show(this.spinnerName);
    this.countryService.getCountries().subscribe({
      next: (countries) => {
        this.countries = [...countries].sort((a, b) => a.name.localeCompare(b.name));
        this.spinnerService.hide(this.spinnerName);
      },
      error: (err) => {
        this.spinnerService.hide(this.spinnerName);
        this.toastr.error(this.errorMessage(err));
      }
    });
  }

  // ===== Picture (optional) =====
  onPictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.picture = null;
    this.picturePreview = null;
    this.pictureError = null;

    if (!file) return;

    if (!this.allowedPictureTypes.includes(file.type)) {
      this.pictureError = 'Picture must be a JPEG, PNG or WebP image.';
      input.value = '';
      return;
    }

    if (file.size > this.maxPictureBytes) {
      this.pictureError = 'Picture must be 5 MB or smaller.';
      input.value = '';
      return;
    }

    this.picture = file;
    const reader = new FileReader();
    reader.onload = () => this.picturePreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  // ===== Submit =====
  async submit(): Promise<void> {
    this.submitted = true;

    if (!this.googleCredential) return;

    if (this.signupForm.invalid || this.pictureError) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.spinnerService.show(this.spinnerName);

    try {
      // Fetched at submit time: v3 tokens expire after about 2 minutes.
      // The API expects exactly the action name "signup".
      const recaptchaToken = await this.recaptcha.execute('signup');
      const value = this.signupForm.value;

      this.practitionerService.signup({
        googleIdToken: this.googleCredential.idToken,
        name: value.name.trim(),
        gender: value.gender,
        qualification: value.qualification?.trim() || undefined,
        countryId: Number(value.countryId),
        city: value.city?.trim() || undefined,
        whatsAppNumber: value.whatsAppNumber.trim(),
        picture: this.picture ?? undefined,
        recaptchaToken
      }).subscribe({
        next: (auth) => {
          this.stopLoading();
          this.accountService.setPractitionerSession(auth);
          this.toastr.success('Welcome to RxHomeoPro!');
          this.router.navigateByUrl('/');
        },
        error: (err) => this.handleError(err)
      });
    } catch (err) {
      // reCAPTCHA failed to load or run (for example blocked by an ad blocker)
      this.stopLoading();
      this.toastr.error(this.errorMessage(err));
    }
  }

  private handleError(err: unknown): void {
    this.stopLoading();

    // The API answers 401 only when the Google token is invalid or has expired
    if (err instanceof HttpErrorResponse && err.status === 401) {
      this.googleCredential = null;
      this.toastr.error('Your Google sign-in has expired. Please sign in with Google again.');
      return;
    }
    // Handle array errors
    if (Array.isArray(err)) {
      err.forEach(error => {
        this.toastr.error(
          typeof error === 'string' ? error : error.message || 'An unexpected error occurred.'
        );
      });
      return;
    }

    this.toastr.error(this.errorMessage(err));
  }

  private stopLoading(): void {
    this.isSubmitting = false;
    this.spinnerService.hide(this.spinnerName);
  }

  // The API returns plain-text messages for most failures, and a validation
  // object (with an "errors" map) when model binding fails.
  private errorMessage(err: unknown): string {
    if (typeof err === 'string') return err;

    const e = err as { error?: unknown; message?: string };
    if (typeof e?.error === 'string') return e.error;

    const errors = (e?.error as { errors?: Record<string, string[]> } | undefined)?.errors;
    if (errors) return Object.values(errors).flat().join(' ');

    return e?.message ?? 'Something went wrong. Please try again.';
  }
}