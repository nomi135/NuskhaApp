import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Symptom, SymptomForm } from '../../../_models/symptom';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Disease } from '../../../_models/disease';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SymptomService } from '../../../_services/symptom.service';
import { DiseaseService } from '../../../_services/disease.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { TextInputComponent } from '../../../_forms/text-input/text-input.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-symptom-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TextInputComponent, NgxSpinnerModule, BsDropdownModule],
  templateUrl: './symptom-form-modal.component.html',
  styleUrl: './symptom-form-modal.component.scss'
})
export class SymptomFormModalComponent implements OnInit {
  @Input() symptom: Symptom | null = null;
  @Output() saved = new EventEmitter<void>();

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  successMessage: string | null = null;
  isSubmitting = false;
  submitted = false;
  private spinnerService = inject(NgxSpinnerService);
  diseases: Disease[] = [];
  selectedDiseaseIds: number[] = [];

  public bsModalRef = inject(BsModalRef);
  private fb = inject(FormBuilder);
  private symptomService = inject(SymptomService);
  private diseaseService = inject(DiseaseService);
  private toastr = inject(ToastrService);
  baseUrl = environment.apiUrl.replace(/\/?api\/?$/, '');
  
  symptomForm : FormGroup = this.fb.group({
    name: ['', Validators.required]
  });

   ngOnInit(): void {
    this.loadDiseases();

    if (this.symptom) {
      this.symptomForm.patchValue({ name: this.symptom.name });
      this.imagePreview = this.baseUrl + this.symptom.imageUrl;
      this.selectedDiseaseIds = this.symptom.diseases.map(d => d.id);
    }
  }

  get isEditMode(): boolean {
    return !!this.symptom;
  }

  loadDiseases(): void {
     this.spinnerService.show(undefined, {
      type: 'line-scale-party',
      bdColor: 'rgba(2555,2555,255,0)',
      color: '#333333'
    });
    this.diseaseService.getDiseases().subscribe({
      next: (diseases) => {
        this.diseases = diseases;
        this.spinnerService.hide();
      },
      error: (err) => {
        this.spinnerService.hide();
         this.toastr.error(err);
        //console.error('Failed to load diseases', err)
      }
    });
  }

  isDiseaseSelected(id: number): boolean {
    return this.selectedDiseaseIds.includes(id);
  }

  toggleDisease(id: number): void {
    this.selectedDiseaseIds = this.isDiseaseSelected(id)
      ? this.selectedDiseaseIds.filter(d => d !== id)
      : [...this.selectedDiseaseIds, id];
  }

  get selectedDiseaseNames(): string {
    if (this.selectedDiseaseIds.length === 0) return 'Select diseases';
    return this.diseases
      .filter(d => this.selectedDiseaseIds.includes(d.id))
      .map(d => d.name)
      .join(', ');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async save(): Promise<void> {
    this.submitted = true;

    const missingImage = !this.selectedFile && !this.imagePreview;
    if (this.symptomForm.invalid || missingImage || this.selectedDiseaseIds.length === 0) {
      this.symptomForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.spinnerService.show(undefined, {
      type: 'line-scale-party',
      bdColor: 'rgba(2555,2555,255,0)',
      color: '#333333'
    });

    try {
      const imageFile = await this.resolveImageFile();

      const model: SymptomForm = {
        name: this.symptomForm.value.name,
        image: imageFile,
        diseaseIds: this.selectedDiseaseIds
      };

      const request$ = this.isEditMode
        ? this.symptomService.updateSymptom(this.symptom!.id, model)
        : this.symptomService.createSymptom(model);

      request$.subscribe({
        next: () => {
          this.isSubmitting = false;
          this.spinnerService.hide();
          this.saved.emit();
           this.successMessage = "Symptom added successfully."
          if(this.isEditMode){
            this.successMessage = "Symptom updated successfully.";
          }
          this.toastr.success(this.successMessage);
          this.bsModalRef.hide();
        },
        error: (err) => {
          this.toastr.error(err);
          //console.error('Failed to save symptom', err);
          this.isSubmitting = false;
          this.spinnerService.hide();
        }
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      this.toastr.error(message);
      //console.error('Failed to prepare image for upload', err);
      this.isSubmitting = false;
      this.spinnerService.hide();
    }
  }

  private async resolveImageFile(): Promise<File> {
    if (this.selectedFile) return this.selectedFile;

    const response = await fetch(this.baseUrl + this.symptom!.imageUrl);
    const blob = await response.blob();
    const filename = this.symptom!.imageUrl.split('/').pop()?.split('?')[0] || 'image.jpg';
    return new File([blob], filename, { type: blob.type || 'image/jpeg' });
  }

  cancel(): void {
    this.bsModalRef.hide();
  }

}
