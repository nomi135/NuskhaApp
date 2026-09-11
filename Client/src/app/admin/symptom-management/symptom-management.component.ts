import { Component, inject, OnInit } from '@angular/core';
import { Symptom } from '../../_models/symptom';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SymptomService } from '../../_services/symptom.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment.development';
import { SymptomFormModalComponent } from '../../modals/symptom-form-modal/symptom-form-modal/symptom-form-modal.component';

@Component({
  selector: 'app-symptom-management',
  standalone: true,
  imports: [NgxSpinnerModule],
  templateUrl: './symptom-management.component.html',
  styleUrl: './symptom-management.component.scss'
})
export class SymptomManagementComponent implements OnInit {
   private symptomService = inject(SymptomService);
   private modalService =  inject(BsModalService);
   private spinnerService = inject(NgxSpinnerService);
   private toastr = inject(ToastrService);
   baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
   symptoms: Symptom[] = [];
   bsModalRef?: BsModalRef;

   ngOnInit(): void {
    this.loadSymptoms();
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
        this.toastr.error(err);
        //console.error('Failed to load symptoms', err);
        this.spinnerService.hide();
      }
    });
  }

  openAddModal(): void {
    this.bsModalRef = this.modalService.show(SymptomFormModalComponent, {
      class: 'modal-dialog-centered',
      initialState: { symptom: null }
    });
    this.bsModalRef.content?.saved.subscribe(() => this.loadSymptoms());
  }

  openEditModal(symptom: Symptom): void {
    this.bsModalRef = this.modalService.show(SymptomFormModalComponent, {
      class: 'modal-dialog-centered',
      initialState: { symptom }
    });
    this.bsModalRef.content?.saved.subscribe(() => this.loadSymptoms());
  }
  
  async deleteSymptom(symptom: Symptom): Promise<void> {
    if (!confirm(`Are you sure you want to delete "${symptom.name}"?`)) return;

    this.spinnerService.show(undefined, {
      type: 'line-scale-party',
      bdColor: 'rgba(2555,2555,255,0)',
      color: '#333333'
    });
    this.symptomService.deleteSymptom(symptom.id).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.toastr.success('Symptom deleted successfully');
        this.loadSymptoms();
      },
      error: (err) => {
        this.toastr.error(err);
        //console.error('Failed to delete symptom', err);
        this.spinnerService.hide();
      }
    });
  }

}
