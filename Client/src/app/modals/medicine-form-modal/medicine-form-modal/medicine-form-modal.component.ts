import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Medicine, MedicineForm } from '../../../_models/medicine';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicineService } from '../../../_services/medicine.service';
import { SymptomService } from '../../../_services/symptom.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Symptom } from '../../../_models/symptom';
import { CommonModule } from '@angular/common';
import { TextInputComponent } from '../../../_forms/text-input/text-input.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@Component({
  selector: 'app-medicine-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TextInputComponent, NgxSpinnerModule, BsDropdownModule],
  templateUrl: './medicine-form-modal.component.html',
  styleUrl: './medicine-form-modal.component.scss'
})
export class MedicineFormModalComponent implements OnInit {
  @Input() medicine: Medicine | null = null;
  @Output() saved = new EventEmitter<void>();

  public bsModalRef = inject(BsModalRef);
  private fb = inject(FormBuilder);
  private medicineService = inject(MedicineService);
  private symptomService = inject(SymptomService);
  private spinnerService = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);

  medicineForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    caution: ['']
  });

  potencies: string[] = [];
  potencyInput = '';

  symptoms: Symptom[] = [];
  selectedSymptomIds: number[] = [];
  symptomSearchTerm = '';

  submitted = false;
  isSubmitting = false;
  successMessage: string | null = null;

  ngOnInit(): void {
    this.loadSymptoms();

    if (this.medicine) {
      this.medicineForm.patchValue({
        name: this.medicine.name,
        description: this.medicine.description ?? '',
        caution: this.medicine.caution ?? ''
      });
      this.potencies = [...this.medicine.potencies];
      this.selectedSymptomIds = this.medicine.symptoms.map(s => s.id);
    }
  }

  get isEditMode(): boolean {
    return !!this.medicine;
  }

  loadSymptoms(): void {
    this.spinnerService.show(undefined, {
      type: 'line-scale-party',
      bdColor: 'rgba(2555,2555,255,0)',
      color: '#333333'
    });
    this.symptomService.getSymptoms().subscribe({
      next: (symptoms) => {
        this.symptoms = symptoms;
        this.spinnerService.hide();
      },
      error: (err) => {
        this.spinnerService.hide();
        this.toastr.error(err);
      }
    });
  }

  addPotency(): void {
    const value = this.potencyInput.trim();
    if (value && !this.potencies.includes(value)) {
      this.potencies = [...this.potencies, value];
    }
    this.potencyInput = '';
  }

  removePotency(value: string): void {
    this.potencies = this.potencies.filter(p => p !== value);
  }

  onPotencyKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addPotency();
    }
  }

  get filteredSymptoms(): Symptom[] {
    const term = this.symptomSearchTerm.trim().toLowerCase();
    if (!term) return this.symptoms;
    return this.symptoms.filter(s => s.name.toLowerCase().includes(term));
  }

  isSymptomSelected(id: number): boolean {
    return this.selectedSymptomIds.includes(id);
  }

  toggleSymptom(id: number): void {
    this.selectedSymptomIds = this.isSymptomSelected(id)
      ? this.selectedSymptomIds.filter(s => s !== id)
      : [...this.selectedSymptomIds, id];
  }

  get selectedSymptomNames(): string {
    if (this.selectedSymptomIds.length === 0) return 'Select symptoms';
    return this.symptoms
      .filter(s => this.selectedSymptomIds.includes(s.id))
      .map(s => s.name)
      .join(', ');
  }

  save(): void {
    this.submitted = true;

    if (this.medicineForm.invalid) {
      this.medicineForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.spinnerService.show(undefined, {
      type: 'line-scale-party',
      bdColor: 'rgba(2555,2555,255,0)',
      color: '#333333'
    });

    const model: MedicineForm = {
      name: this.medicineForm.value.name,
      description: this.medicineForm.value.description || undefined,
      caution: this.medicineForm.value.caution || undefined,
      potencies: this.potencies,
      symptomIds: this.selectedSymptomIds
    };

    const request$ = this.isEditMode
      ? this.medicineService.updateMedicine(this.medicine!.id, model)
      : this.medicineService.createMedicine(model);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.spinnerService.hide();
        this.saved.emit();
        this.successMessage = this.isEditMode
          ? 'Medicine updated successfully.'
          : 'Medicine added successfully.';
        this.toastr.success(this.successMessage);
        this.bsModalRef.hide();
      },
      error: (err) => {
        this.toastr.error(err);
        this.isSubmitting = false;
        this.spinnerService.hide();
      }
    });
  }

   cancel(): void {
    this.bsModalRef.hide();
  }

}
