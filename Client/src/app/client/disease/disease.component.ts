import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DiseaseService } from '../../_services/disease.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Disease } from '../../_models/disease';
import { environment } from '../../../environments/environment';
import { InfiniteScrollDirective } from '../../_shared/infinite-scroll/infinite-scroll.directive';

@Component({
  selector: 'app-disease',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxSpinnerModule, InfiniteScrollDirective],
  templateUrl: './disease.component.html',
  styleUrl: './disease.component.scss'
})
export class DiseaseComponent implements OnInit {
  private diseaseService = inject(DiseaseService);
  private spinnerService = inject(NgxSpinnerService);
  private readonly spinnerName = 'disease-spinner';
  private toastr = inject(ToastrService);
  private router = inject(Router);
  baseUrl = environment.apiUrl.replace(/\/?api\/?$/, '');

  allDiseases: Disease[] = [];
  searchTerm = '';
  batchSize = 6;
  visibleCount = this.batchSize;

  ngOnInit(): void {
    this.loadDiseases();
  }

  loadDiseases(): void {
   this.spinnerService.show(this.spinnerName);
    this.diseaseService.getDiseases().subscribe({
      next: (diseases) => {
        this.allDiseases = diseases;
        this.spinnerService.hide(this.spinnerName);
      },
      error: (err) => {
        this.spinnerService.hide(this.spinnerName);
        this.toastr.error(err);
      }
    });
  }

  get filteredDiseases(): Disease[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.allDiseases;
    return this.allDiseases.filter(d => d.name.toLowerCase().includes(term));
  }

  get visibleDiseases(): Disease[] {
    return this.filteredDiseases.slice(0, this.visibleCount);
  }

  get hasMore(): boolean {
    return this.visibleCount < this.filteredDiseases.length;
  }

  onSearchChange(): void {
    this.visibleCount = this.batchSize;
  }

  loadMore(): void {
    if (!this.hasMore) return;
    this.visibleCount += this.batchSize;
  }

}
