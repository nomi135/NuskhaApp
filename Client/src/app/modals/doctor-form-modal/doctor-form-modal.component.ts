import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextInputComponent } from '../../_forms/text-input/text-input.component';
import { Doctor, DoctorForm } from '../../_models/doctor';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DoctorService } from '../../_services/doctor.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CountryService } from '../../_services/country.service';
import { Country } from '../../_models/country';

@Component({
  selector: 'app-doctor-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TextInputComponent, NgxSpinnerModule,  BsDropdownModule],
  templateUrl: './doctor-form-modal.component.html',
  styleUrl: './doctor-form-modal.component.scss'
})
export class DoctorFormModalComponent implements OnInit{
  @Input() doctor: Doctor | null = null;
  @Output() saved = new EventEmitter<void>();

  public bsModalRef = inject(BsModalRef);
  private fb = inject(FormBuilder);
  private doctorService = inject(DoctorService);
  private countryService = inject(CountryService);
  private spinnerService = inject(NgxSpinnerService);
  private readonly spinnerName = 'doctor-form-spinner';
  private toastr = inject(ToastrService);

  doctorForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    isGlobal: [false]
  });

  countries: Country[] = [];
  selectedCountryIds: number[] = [];
  countrySearchTerm = '';

  isSubmitting = false;
  successMessage: string | null = null;

  ngOnInit(): void {
    this.loadCountries();

    if (this.doctor) {
      this.doctorForm.patchValue({
        name: this.doctor.name,
        isGlobal: this.doctor.isGlobal
      });
      this.selectedCountryIds = this.doctor.countries.map(c => c.id);
    }

    // Clear any selected countries whenever Global is turned on
    this.doctorForm.get('isGlobal')?.valueChanges.subscribe((isGlobal: boolean) => {
      if (isGlobal) {
        this.selectedCountryIds = [];
      }
    });
  }

  get isEditMode(): boolean {
    return !!this.doctor;
  }

  get isGlobal(): boolean {
    return this.doctorForm.value.isGlobal;
  }

  loadCountries(): void {
    this.spinnerService.show(this.spinnerName);
    this.countryService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
         this.spinnerService.hide(this.spinnerName);
      },
      error: (err) => {
        this.toastr.error(err);
        this.spinnerService.hide(this.spinnerName);
      }
    });
  }

  // ===== Countries multiselect =====
  get filteredCountries(): Country[] {
    const term = this.countrySearchTerm.trim().toLowerCase();
    if (!term) return this.countries;
    return this.countries.filter(c => c.name.toLowerCase().includes(term));
  }

  get selectedCountryNames(): string {
    if (this.selectedCountryIds.length === 0) return 'Select countries';
    return this.countries
      .filter(c => this.selectedCountryIds.includes(c.id))
      .map(c => c.name)
      .join(', ');
  }

  isCountrySelected(id: number): boolean {
    return this.selectedCountryIds.includes(id);
  }

  toggleCountry(id: number): void {
    this.selectedCountryIds = this.isCountrySelected(id)
      ? this.selectedCountryIds.filter(c => c !== id)
      : [...this.selectedCountryIds, id];
  }


  save(): void {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.spinnerService.show(this.spinnerName);

    const model: DoctorForm = {
      name: this.doctorForm.value.name,
      isGlobal: this.doctorForm.value.isGlobal,
      countryIds: this.doctorForm.value.isGlobal ? [] : this.selectedCountryIds
    };

    const request$ = this.isEditMode
      ? this.doctorService.updateDoctor(this.doctor!.id, model)
      : this.doctorService.createDoctor(model);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.spinnerService.hide(this.spinnerName);
        this.saved.emit();
        this.successMessage = this.isEditMode
          ? 'Doctor updated successfully.'
          : 'Doctor added successfully.';
        this.toastr.success(this.successMessage);
        this.bsModalRef.hide();
      },
      error: (err) => {
        this.toastr.error(err);
        this.isSubmitting = false;
        this.spinnerService.hide(this.spinnerName);
      }
    });
  }

  cancel(): void {
    this.bsModalRef.hide();
  }

}
