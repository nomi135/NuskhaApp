import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { InfiniteScrollDirective } from '../../_shared/infinite-scroll/infinite-scroll.directive';
import { MedicineService } from '../../_services/medicine.service';
import { SymptomService } from '../../_services/symptom.service';
import { DoctorService } from '../../_services/doctor.service';
import { ToastrService } from 'ngx-toastr';
import { Medicine, MedicineDoctorLink } from '../../_models/medicine';

@Component({
  selector: 'app-medicine',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxSpinnerModule, InfiniteScrollDirective],
  templateUrl: './medicine.component.html',
  styleUrl: './medicine.component.scss'
})
export class MedicineComponent implements OnInit {
  private medicineService = inject(MedicineService);
  private symptomService = inject(SymptomService);
  private doctorService = inject(DoctorService);
  private spinnerService = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readonly spinnerName = 'medicine-spinner';

  allMedicines: Medicine[] = [];
  searchTerm = '';

  batchSize = 10;
  visibleCount = this.batchSize;

  filterSymptomId: number | null = null;
  filterSymptomName: string | null = null;
  filterDoctorId: number | null = null;
  filterDoctorName: string | null = null;

  ngOnInit(): void {
    // Subscribing (not snapshot) so navigating between different filters
    // while already on this page updates correctly.
    this.route.queryParamMap.subscribe(params => {
      const symptomIdParam = params.get('symptomId');
      const doctorIdParam = params.get('doctorId');
      this.filterSymptomId = symptomIdParam ? Number(symptomIdParam) : null;
      this.filterDoctorId = doctorIdParam ? Number(doctorIdParam) : null;
      this.searchTerm = '';
      this.visibleCount = this.batchSize;
      this.loadMedicines();
    });
  }

  loadMedicines(): void {
    this.spinnerService.show(this.spinnerName);

    this.medicineService
      .getMedicines(undefined, this.filterSymptomId ?? undefined, this.filterDoctorId ?? undefined)
      .subscribe({
        next: (medicines) => {
          this.allMedicines = medicines;
          this.spinnerService.hide(this.spinnerName);
        },
        error: (err) => {
          this.spinnerService.hide(this.spinnerName);
          this.toastr.error(err);
        }
      });

    if (this.filterSymptomId) {
      this.symptomService.getSymptom(this.filterSymptomId).subscribe({
        next: (symptom) => this.filterSymptomName = symptom.name,
        error: () => this.filterSymptomName = null
      });
    } else {
      this.filterSymptomName = null;
    }

    if (this.filterDoctorId) {
      this.doctorService.getDoctor(this.filterDoctorId).subscribe({
        next: (doctor) => this.filterDoctorName = doctor.name,
        error: () => this.filterDoctorName = null
      });
    } else {
      this.filterDoctorName = null;
    }
  }

  get filteredMedicines(): Medicine[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.allMedicines;
    return this.allMedicines.filter(m => m.name.toLowerCase().includes(term));
  }

  get visibleMedicines(): Medicine[] {
    return this.filteredMedicines.slice(0, this.visibleCount);
  }

  get hasMore(): boolean {
    return this.visibleCount < this.filteredMedicines.length;
  }

  onSearchChange(): void {
    this.visibleCount = this.batchSize;
  }

  loadMore(): void {
    if (!this.hasMore) return;
    this.visibleCount += this.batchSize;
  }

  // Narrows a medicine's doctorLinks to just what's relevant under the active filter(s)
  relevantLinks(medicine: Medicine): MedicineDoctorLink[] {
    let links = medicine.doctorLinks;
    if (this.filterDoctorId) {
      links = links.filter(l => l.doctorId === this.filterDoctorId);
    }
    if (this.filterSymptomId) {
      links = links.filter(l => l.symptoms.some(s => s.id === this.filterSymptomId));
    }
    return links;
  }

  clearFilters(): void {
    this.router.navigate(['/medicine']);
  }
}
