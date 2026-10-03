import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SymptomService } from '../../_services/symptom.service';
import { DiseaseService } from '../../_services/disease.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Symptom } from '../../_models/symptom';
import { environment } from '../../../environments/environment';
import { InfiniteScrollDirective } from '../../_shared/infinite-scroll/infinite-scroll.directive';

@Component({
  selector: 'app-symptom',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxSpinnerModule, InfiniteScrollDirective],
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
  batchSize = 10;
  visibleCount = this.batchSize;

  filterDiseaseId: number | null = null;
  filterDiseaseName: string | null = null;

  ngOnInit(): void {
    // Subscribing (not snapshot) so navigating between two different
    // diseaseId filters while already on this page updates correctly.
    this.route.queryParamMap.subscribe(params => {
      const diseaseIdParam = params.get('diseaseId');
      this.filterDiseaseId = diseaseIdParam ? Number(diseaseIdParam) : null;
      this.searchTerm = '';
      this.visibleCount = this.batchSize;
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

  get visibleSymptoms(): Symptom[] {
    return this.filteredSymptoms.slice(0, this.visibleCount);
  }

  get hasMore(): boolean {
    return this.visibleCount < this.filteredSymptoms.length;
  }

  onSearchChange(): void {
    this.visibleCount = this.batchSize;
  }

  loadMore(): void {
    if (!this.hasMore) return;
    this.visibleCount += this.batchSize;
  }

  clearFilter(): void {
    this.router.navigate(['/symptom']);
  }

}
