import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '../../_shared/pagination/pagination/pagination.component';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { DoctorService } from '../../_services/doctor.service';
import { ToastrService } from 'ngx-toastr';
import { Doctor } from '../../_models/doctor';

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent, NgxSpinnerModule],
  templateUrl: './doctor.component.html',
  styleUrl: './doctor.component.scss'
})
export class DoctorComponent implements OnInit {
  private doctorService = inject(DoctorService);
  private spinnerService = inject(NgxSpinnerService);
  private readonly spinnerName = 'doctor-spinner';
  private toastr = inject(ToastrService);

  allDoctors: Doctor[] = [];
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.spinnerService.show(this.spinnerName);
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.allDoctors = doctors;
        this.spinnerService.hide(this.spinnerName);
      },
      error: (err) => {
        this.spinnerService.hide(this.spinnerName);
        this.toastr.error(err);
      }
    });
  }

  get filteredDoctors(): Doctor[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.allDoctors;
    return this.allDoctors.filter(d => d.name.toLowerCase().includes(term));
  }

  get pagedDoctors(): Doctor[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredDoctors.slice(start, start + this.pageSize);
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

}
