import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextInputComponent } from '../../../_forms/text-input/text-input.component';
import { Doctor, DoctorForm } from '../../../_models/doctor';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DoctorService } from '../../../_services/doctor.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-doctor-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TextInputComponent, NgxSpinnerModule],
  templateUrl: './doctor-form-modal.component.html',
  styleUrl: './doctor-form-modal.component.scss'
})
export class DoctorFormModalComponent implements OnInit{
  @Input() doctor: Doctor | null = null;
  @Output() saved = new EventEmitter<void>();

  public bsModalRef = inject(BsModalRef);
  private fb = inject(FormBuilder);
  private doctorService = inject(DoctorService);
  private spinnerService = inject(NgxSpinnerService);
  private readonly spinnerName = 'doctor-form-spinner';
  private toastr = inject(ToastrService);

  doctorForm: FormGroup = this.fb.group({
    name: ['', Validators.required]
  });

  isSubmitting = false;
  successMessage: string | null = null;

  ngOnInit(): void {
    if (this.doctor) {
      this.doctorForm.patchValue({ name: this.doctor.name });
    }
  }

  get isEditMode(): boolean {
    return !!this.doctor;
  }

  save(): void {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.spinnerService.show(this.spinnerName);

    const model: DoctorForm = {
      name: this.doctorForm.value.name
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
