import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { DoctorService } from '../../_services/doctor.service';
import { ToastrService } from 'ngx-toastr';
import { Doctor } from '../../_models/doctor';
import { InfiniteScrollDirective } from '../../_shared/infinite-scroll/infinite-scroll.directive';

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxSpinnerModule, InfiniteScrollDirective],
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
  batchSize = 10;
  visibleCount = this.batchSize;

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

  get visibleDoctors(): Doctor[] {
    return this.filteredDoctors.slice(0, this.visibleCount);
  }

  get hasMore(): boolean {
    return this.visibleCount < this.filteredDoctors.length;
  }

  onSearchChange(): void {
    this.visibleCount = this.batchSize;
  }

  loadMore(): void {
    if (!this.hasMore) return;
    this.visibleCount += this.batchSize;
  }

}
