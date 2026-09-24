import { Component, inject, OnInit } from '@angular/core';
import { DiseaseService } from '../../_services/disease.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Disease } from '../../_models/disease';
import { DiseaseFormModalComponent } from '../../modals/disease-form-modal/disease-form-modal.component';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../_shared/pagination/pagination/pagination.component';

@Component({
  selector: 'app-disease-management',
  standalone: true,
  imports: [NgxSpinnerModule, CommonModule, FormsModule, PaginationComponent],
  templateUrl: './disease-management.component.html',
  styleUrl: './disease-management.component.scss'
})
export class DiseaseManagementComponent implements OnInit {
  private diseaseService = inject(DiseaseService);
  private modalService =  inject(BsModalService);
  private spinnerService = inject(NgxSpinnerService);
  private readonly spinnerName = 'disease-list-spinner';
  private toastr = inject(ToastrService);
  baseUrl = environment.apiUrl.replace(/\/?api\/?$/, '');
  diseases: Disease[] = [];
  bsModalRef?: BsModalRef;
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.loadDiseases();
  }

  loadDiseases(): void {
    this.spinnerService.show(this.spinnerName);
    this.diseaseService.getDiseases().subscribe({
      next: (diseases) => {
        this.diseases = diseases;
        this.clampCurrentPage();
        this.spinnerService.hide(this.spinnerName);
      },
      error: (err) => {
        this.toastr.error(err);
        //console.error('Failed to load diseases', err);
        this.spinnerService.hide(this.spinnerName);
      }
    });
  }

  get filteredDiseases(): Disease[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.diseases;
    return this.diseases.filter(d => d.name.toLowerCase().includes(term));
  }

  get pagedDiseases(): Disease[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredDiseases.slice(start, start + this.pageSize);
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  private clampCurrentPage(): void {
    const totalPages = Math.max(1, Math.ceil(this.filteredDiseases.length / this.pageSize));
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }
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

    this.spinnerService.hide(this.spinnerName);
    this.diseaseService.deleteDisease(disease.id).subscribe({
      next: () => {
        this.spinnerService.hide(this.spinnerName);
        this.toastr.success("Disease deleted successfully.");
        this.loadDiseases();
      },
      error: (err) => {
        this.toastr.error(err);
        //console.error('Failed to delete disease', err);
        this.spinnerService.hide(this.spinnerName);
      }
    });
  }
  
}
