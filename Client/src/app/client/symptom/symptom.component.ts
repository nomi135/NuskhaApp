import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaginationComponent } from '../../_shared/pagination/pagination/pagination.component';
import { SymptomService } from '../../_services/symptom.service';
import { DiseaseService } from '../../_services/disease.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Symptom } from '../../_models/symptom';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-symptom',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent, NgxSpinnerModule],
  templateUrl: './symptom.component.html',
  styleUrl: './symptom.component.scss'
})
export class SymptomComponent implements OnInit {
  private symptomService = inject(SymptomService);
  private diseaseService = inject(DiseaseService);
  private spinnerService = inject(NgxSpinnerService);
  private readonly spinnerName = 'symptom-spinner';
  private toastr = inject(ToastrService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  baseUrl = environment.apiUrl.replace(/\/?api\/?$/, '');

  allSymptoms: Symptom[] = [];
  searchTerm = '';
  currentPage = 1;
  pageSize = 6;

  filterDiseaseId: number | null = null;
  filterDiseaseName: string | null = null;

  ngOnInit(): void {
    // Subscribing (not snapshot) so navigating between two different
    // diseaseId filters while already on this page updates correctly.
    this.route.queryParamMap.subscribe(params => {
      const diseaseIdParam = params.get('diseaseId');
      this.filterDiseaseId = diseaseIdParam ? Number(diseaseIdParam) : null;
      this.searchTerm = '';
      this.currentPage = 1;
      this.loadSymptoms();
    });
  }

  loadSymptoms(): void {
    this.spinnerService.show(this.spinnerName);

    this.symptomService.getSymptoms(this.filterDiseaseId ?? undefined).subscribe({
      next: (symptoms) => {
        this.allSymptoms = symptoms;
        this.spinnerService.hide(this.spinnerName);
      },
      error: (err) => {
        this.spinnerService.hide(this.spinnerName);
        this.toastr.error(err);
      }
    });

    if (this.filterDiseaseId) {
      this.diseaseService.getDisease(this.filterDiseaseId).subscribe({
        next: (disease) => this.filterDiseaseName = disease.name,
        error: () => this.filterDiseaseName = null
      });
    } else {
      this.filterDiseaseName = null;
    }
  }

  get filteredSymptoms(): Symptom[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.allSymptoms;
    return this.allSymptoms.filter(s => s.name.toLowerCase().includes(term));
  }

  get pagedSymptoms(): Symptom[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSymptoms.slice(start, start + this.pageSize);
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  clearFilter(): void {
    this.router.navigate(['/symptom']);
  }
}
