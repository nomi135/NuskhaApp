import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PaginationComponent } from '../../_shared/pagination/pagination/pagination.component';
import { DiseaseService } from '../../_services/disease.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Disease } from '../../_models/disease';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-disease',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent, NgxSpinnerModule],
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
  currentPage = 1;
  pageSize = 6;

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

}
