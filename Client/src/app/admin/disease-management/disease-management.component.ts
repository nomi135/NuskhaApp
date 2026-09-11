import { Component, inject, OnInit } from '@angular/core';
import { DiseaseService } from '../../_services/disease.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Disease } from '../../_models/disease';
import { DiseaseFormModalComponent } from '../../modals/disease-form-modal/disease-form-modal/disease-form-modal.component';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-disease-management',
  standalone: true,
  imports: [NgxSpinnerModule],
  templateUrl: './disease-management.component.html',
  styleUrl: './disease-management.component.scss'
})
export class DiseaseManagementComponent implements OnInit {
  private diseaseService = inject(DiseaseService);
  private modalService =  inject(BsModalService);
  private spinnerService = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);
  baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
  diseases: Disease[] = [];
  bsModalRef?: BsModalRef;

  ngOnInit(): void {
    this.loadDiseases();
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
        this.toastr.error(err);
        //console.error('Failed to load diseases', err);
        this.spinnerService.hide();
      }
    });
  }

  openAddModal(): void {
    this.bsModalRef = this.modalService.show(DiseaseFormModalComponent, {
      class: 'modal-dialog-centered',
      initialState: { disease: null }
    });

    this.bsModalRef.content?.saved.subscribe(() => this.loadDiseases());
  }

  openEditModal(disease: Disease): void {
    this.bsModalRef = this.modalService.show(DiseaseFormModalComponent, {
      class: 'modal-dialog-centered',
      initialState: { disease }
    });

    this.bsModalRef.content?.saved.subscribe(() => this.loadDiseases());
  }

  deleteDisease(disease: Disease): void {
    if (!confirm(`Are you sure you want to delete "${disease.name}"?`)) return;

    this.spinnerService.show(undefined, {
      type: 'line-scale-party',
      bdColor: 'rgba(2555,2555,255,0)',
      color: '#333333'
    });
    this.diseaseService.deleteDisease(disease.id).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.toastr.success("Disease deleted successfully.");
        this.loadDiseases();
      },
      error: (err) => {
        this.toastr.error(err);
        //console.error('Failed to delete disease', err);
        this.spinnerService.hide();
      }
    });
  }
  
}
