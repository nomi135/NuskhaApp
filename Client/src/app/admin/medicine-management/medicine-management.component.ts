import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Medicine } from '../../_models/medicine';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MedicineService } from '../../_services/medicine.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MedicineFormModalComponent } from '../../modals/medicine-form-modal/medicine-form-modal.component';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../_shared/pagination/pagination/pagination.component';
import { SymptomLookup } from '../../_models/symptom-lookup';

@Component({
  selector: 'app-medicine-management',
  standalone: true,
  imports: [NgxSpinnerModule, CommonModule, FormsModule, PaginationComponent],
  templateUrl: './medicine-management.component.html',
  styleUrl: './medicine-management.component.scss'
})
export class MedicineManagementComponent implements OnInit {
  medicines: Medicine[] = [];
  bsModalRef?: BsModalRef;

  private medicineService = inject(MedicineService);
  private modalService = inject(BsModalService);
  private spinnerService = inject(NgxSpinnerService);
  private readonly spinnerName = 'medicine-list-spinner';
  private toastr = inject(ToastrService);
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.spinnerService.show(this.spinnerName);
    this.medicineService.getMedicines().subscribe({
      next: (medicines) => {
        this.medicines = medicines;
        this.clampCurrentPage();
        this.spinnerService.hide(this.spinnerName);
      },
      error: (err) => {
        this.spinnerService.hide(this.spinnerName);
        this.toastr.error(err);
      }
    });
  }

  get filteredMedicines(): Medicine[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.medicines;
    return this.medicines.filter(d => d.name.toLowerCase().includes(term));
  }
    
  get pagedMedicines(): Medicine[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMedicines.slice(start, start + this.pageSize);
  }
    
  onSearchChange(): void {
    this.currentPage = 1;
  }
  
  onPageChange(page: number): void {
    this.currentPage = page;
  }
  
  private clampCurrentPage(): void {
    const totalPages = Math.max(1, Math.ceil(this.filteredMedicines.length / this.pageSize));
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }
  }

  openAddModal(): void {
    this.bsModalRef = this.modalService.show(MedicineFormModalComponent, {
      class: 'modal-dialog-centered modal-lg',
      initialState: { medicine: null }
    });
    this.bsModalRef.content?.saved.subscribe(() => this.loadMedicines());
  }

  openEditModal(medicine: Medicine): void {
    this.bsModalRef = this.modalService.show(MedicineFormModalComponent, {
      class: 'modal-dialog-centered modal-lg',
      initialState: { medicine }
    });
    this.bsModalRef.content?.saved.subscribe(() => this.loadMedicines());
  }

  async deleteMedicine(medicine: Medicine): Promise<void> {
    if (!confirm(`Are you sure you want to delete "${medicine.name}"?`)) return;

    this.spinnerService.show(this.spinnerName);
    this.medicineService.deleteMedicine(medicine.id).subscribe({
      next: () => {
        this.spinnerService.hide(this.spinnerName);
        this.loadMedicines();
        this.toastr.success('Medicine deleted successfully');
      },
      error: (err) => {
        this.spinnerService.hide(this.spinnerName);
        this.toastr.error(err);
      }
    });
  }

  uniquePotencies(medicine: Medicine): string[] {
    const all = medicine.doctorLinks.flatMap(link => link.potencies);
    return Array.from(new Set(all));
  }

  uniqueSymptoms(medicine: Medicine): SymptomLookup[] {
    const seen = new Map<number, SymptomLookup>();
    medicine.doctorLinks.forEach(link => {
      link.symptoms.forEach(s => {
        if (!seen.has(s.id)) seen.set(s.id, s);
      });
    });
    return Array.from(seen.values());
  }

}
