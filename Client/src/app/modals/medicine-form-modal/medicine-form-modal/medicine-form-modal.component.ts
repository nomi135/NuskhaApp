import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Medicine, MedicineDoctorLinkForm, MedicineForm } from '../../../_models/medicine';
import { Symptom } from '../../../_models/symptom';
import { Doctor } from '../../../_models/doctor';
import { MedicineService } from '../../../_services/medicine.service';
import { SymptomService } from '../../../_services/symptom.service';
import { DoctorService } from '../../../_services/doctor.service';
import { TextInputComponent } from '../../../_forms/text-input/text-input.component';

interface DoctorLinkData {
  potencies: string[];
  potencyInput: string;
  selectedSymptomIds: number[];
  symptomSearchTerm: string;
}

@Component({
  selector: 'app-medicine-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TextInputComponent, BsDropdownModule, NgxSpinnerModule],
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
  private doctorService = inject(DoctorService);
  private spinnerService = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);

  medicineForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    caution: ['']
  });

  doctors: Doctor[] = [];
  symptoms: Symptom[] = [];

  selectedDoctorIds: number[] = [];
  doctorSearchTerm = '';
  private doctorLinkData = new Map<number, DoctorLinkData>();

  submitted = false;
  isSubmitting = false;
  successMessage: string | null = null;

  ngOnInit(): void {
    this.loadDoctors();
    this.loadSymptoms();

    if (this.medicine) {
      this.medicineForm.patchValue({
        name: this.medicine.name,
        description: this.medicine.description ?? '',
        caution: this.medicine.caution ?? ''
      });

      this.selectedDoctorIds = this.medicine.doctorLinks.map(link => link.doctorId);
      this.medicine.doctorLinks.forEach(link => {
        this.doctorLinkData.set(link.doctorId, {
          potencies: [...link.potencies],
          potencyInput: '',
          selectedSymptomIds: link.symptoms.map(s => s.id),
          symptomSearchTerm: ''
        });
      });
    }
  }

  get isEditMode(): boolean {
    return !!this.medicine;
  }

  loadDoctors(): void {
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => this.doctors = doctors,
      error: (err) => this.toastr.error(err)
    });
  }

  loadSymptoms(): void {
    this.symptomService.getSymptoms().subscribe({
      next: (symptoms) => this.symptoms = symptoms,
      error: (err) => this.toastr.error(err)
    });
  }

  // ===== Doctors multiselect =====
  get filteredDoctors(): Doctor[] {
    const term = this.doctorSearchTerm.trim().toLowerCase();
    if (!term) return this.doctors;
    return this.doctors.filter(d => d.name.toLowerCase().includes(term));
  }

  get selectedDoctorNames(): string {
    if (this.selectedDoctorIds.length === 0) return 'Select doctors';
    return this.doctors
      .filter(d => this.selectedDoctorIds.includes(d.id))
      .map(d => d.name)
      .join(', ');
  }

  get selectedDoctors(): Doctor[] {
    return this.doctors.filter(d => this.selectedDoctorIds.includes(d.id));
  }

  isDoctorSelected(id: number): boolean {
    return this.selectedDoctorIds.includes(id);
  }

  toggleDoctor(id: number): void {
    if (this.isDoctorSelected(id)) {
      this.selectedDoctorIds = this.selectedDoctorIds.filter(d => d !== id);
    } else {
      this.selectedDoctorIds = [...this.selectedDoctorIds, id];
      this.ensureRowData(id);
    }
  }

  private ensureRowData(doctorId: number): DoctorLinkData {
    let data = this.doctorLinkData.get(doctorId);
    if (!data) {
      data = { potencies: [], potencyInput: '', selectedSymptomIds: [], symptomSearchTerm: '' };
      this.doctorLinkData.set(doctorId, data);
    }
    return data;
  }

  getRowData(doctorId: number): DoctorLinkData {
    return this.ensureRowData(doctorId);
  }

  // ===== Potencies (per doctor) =====
  addPotency(row: DoctorLinkData): void {
    const value = row.potencyInput.trim();
    if (value && !row.potencies.includes(value)) {
      row.potencies = [...row.potencies, value];
    }
    row.potencyInput = '';
  }

  removePotency(row: DoctorLinkData, value: string): void {
    row.potencies = row.potencies.filter(p => p !== value);
  }

  onPotencyKeydown(event: KeyboardEvent, row: DoctorLinkData): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addPotency(row);
    }
  }

  // ===== Symptoms (per doctor) =====
  filteredSymptoms(row: DoctorLinkData): Symptom[] {
    const term = row.symptomSearchTerm.trim().toLowerCase();
    if (!term) return this.symptoms;
    return this.symptoms.filter(s => s.name.toLowerCase().includes(term));
  }

  isSymptomSelected(row: DoctorLinkData, id: number): boolean {
    return row.selectedSymptomIds.includes(id);
  }

  toggleSymptom(row: DoctorLinkData, id: number): void {
    row.selectedSymptomIds = this.isSymptomSelected(row, id)
      ? row.selectedSymptomIds.filter(s => s !== id)
      : [...row.selectedSymptomIds, id];
  }

  selectedSymptomNames(row: DoctorLinkData): string {
    if (row.selectedSymptomIds.length === 0) return 'Select symptoms';
    return this.symptoms
      .filter(s => row.selectedSymptomIds.includes(s.id))
      .map(s => s.name)
      .join(', ');
  }

  // ===== Save =====
  save(): void {
    this.submitted = true;

    if (this.medicineForm.invalid) {
      this.medicineForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.spinnerService.show(undefined, {
      type: 'line-scale-party',
      bdColor: 'rgba(255,255,255,0)',
      color: '#333333'
    });

    const doctorLinks: MedicineDoctorLinkForm[] = this.selectedDoctorIds.map(doctorId => {
      const row = this.getRowData(doctorId);
      return {
        doctorId,
        potencies: row.potencies,
        symptomIds: row.selectedSymptomIds
      };
    });

    const model: MedicineForm = {
      name: this.medicineForm.value.name,
      description: this.medicineForm.value.description || undefined,
      caution: this.medicineForm.value.caution || undefined,
      doctorLinks
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