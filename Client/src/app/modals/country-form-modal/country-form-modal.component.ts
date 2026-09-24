import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextInputComponent } from '../../_forms/text-input/text-input.component';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Country, CountryForm } from '../../_models/country';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CountryService } from '../../_services/country.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-country-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TextInputComponent, NgxSpinnerModule],
  templateUrl: './country-form-modal.component.html',
  styleUrl: './country-form-modal.component.scss'
})
export class CountryFormModalComponent implements OnInit {
  @Input() country: Country | null = null;
  @Output() saved = new EventEmitter<void>();

  public bsModalRef = inject(BsModalRef);
  private fb = inject(FormBuilder);
  private countryService = inject(CountryService);
  private spinnerService = inject(NgxSpinnerService);
  private readonly spinnerName = 'country-form-spinner';
  private toastr = inject(ToastrService);

  countryForm: FormGroup = this.fb.group({
    name: ['', Validators.required]
  });

  isSubmitting = false;
  successMessage: string | null = null;

  ngOnInit(): void {
    if (this.country) {
      this.countryForm.patchValue({ name: this.country.name });
    }
  }

  get isEditMode(): boolean {
    return !!this.country;
  }

  save(): void {
    if (this.countryForm.invalid) {
      this.countryForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.spinnerService.show(this.spinnerName);

    const model: CountryForm = {
      name: this.countryForm.value.name
    };

    const request$ = this.isEditMode
      ? this.countryService.updateCountry(this.country!.id, model)
      : this.countryService.createCountry(model);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.spinnerService.hide(this.spinnerName);
        this.saved.emit();
        this.successMessage = this.isEditMode
          ? 'Country updated successfully.'
          : 'Country added successfully.';
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
