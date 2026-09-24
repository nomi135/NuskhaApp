import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Disease, DiseaseForm } from '../../_models/disease';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DiseaseService } from '../../_services/disease.service';
import { TextInputComponent } from '../../_forms/text-input/text-input.component';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-disease-form-modal',
  standalone: true,
  imports: [NgxSpinnerModule, TextInputComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './disease-form-modal.component.html',
  styleUrl: './disease-form-modal.component.scss'
})
export class DiseaseFormModalComponent implements OnInit {
  @Input() disease: Disease | null = null;
  @Output() saved = new EventEmitter<void>();

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  successMessage: string | null = null;
  isSubmitting = false;
  submitted = false;
  private spinnerService = inject(NgxSpinnerService);
  private readonly spinnerName = 'disease-form-spinner';
  public bsModalRef = inject(BsModalRef);
  private fb = inject(FormBuilder);
  private diseaseService = inject(DiseaseService);
  private toastr = inject(ToastrService);
  baseUrl = environment.apiUrl.replace(/\/?api\/?$/, '');

  diseaseForm : FormGroup = this.fb.group({
    name: ['', Validators.required]
  });

   ngOnInit(): void {
    if (this.disease) {
      this.diseaseForm.patchValue({ name: this.disease.name });
      this.imagePreview = this.baseUrl + this.disease.imageUrl;
    }
  }

  get isEditMode(): boolean {
    return !!this.disease;
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
    if (this.diseaseForm.invalid || missingImage) {
      this.diseaseForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.spinnerService.show(this.spinnerName);

    try {
      const imageFile = await this.resolveImageFile();

      const model: DiseaseForm = {
        name: this.diseaseForm.value.name,
        image: imageFile
      };

      const request$ = this.isEditMode
        ? this.diseaseService.updateDisease(this.disease!.id, model)
        : this.diseaseService.createDisease(model);

      request$.subscribe({
        next: () => {
          this.isSubmitting = false;
          this.spinnerService.hide(this.spinnerName);
          this.saved.emit();
          this.successMessage = "Disease added successfully."
          if(this.isEditMode){
            this.successMessage = "Disease updated successfully.";
          }
          this.toastr.success(this.successMessage);
          this.bsModalRef.hide();
        },
        error: (err) => {
          this.toastr.error(err);
          //console.error('Failed to save disease', err);
          this.isSubmitting = false;
          this.spinnerService.hide(this.spinnerName);
        }
      });
    } catch (err: unknown) {
       const message = err instanceof Error ? err.message : 'An unexpected error occurred';
       this.toastr.error(message);
      //console.error('Failed to prepare image for upload', err);
      this.isSubmitting = false;
      this.spinnerService.hide(this.spinnerName);
    }
  }

  private async resolveImageFile(): Promise<File> {
    if (this.selectedFile) return this.selectedFile;

    // No new file picked in edit mode — re-fetch the existing image so the
    // required Image field is still satisfied without forcing a manual re-upload.
    const response = await fetch(this.baseUrl + this.disease!.imageUrl);
    const blob = await response.blob();
    const filename = this.disease!.imageUrl.split('/').pop()?.split('?')[0] || 'image.jpg';
    return new File([blob], filename, { type: blob.type || 'image/jpeg' });
  }

  cancel(): void {
    this.bsModalRef.hide();
  }
  
}
