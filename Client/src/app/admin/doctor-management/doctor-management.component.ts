import { Component, inject, OnInit } from '@angular/core';
import { Doctor } from '../../_models/doctor';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DoctorService } from '../../_services/doctor.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DoctorFormModalComponent } from '../../modals/doctor-form-modal/doctor-form-modal.component';
import { ConfirmService } from '../../_services/confirm.service';

@Component({
  selector: 'app-doctor-management',
  standalone: true,
  imports: [NgxSpinnerModule],
  templateUrl: './doctor-management.component.html',
  styleUrl: './doctor-management.component.scss'
})
export class DoctorManagementComponent implements OnInit {
  doctors: Doctor[] = [];
  bsModalRef?: BsModalRef;

  private doctorService = inject(DoctorService);
  private confirmService = inject(ConfirmService);
  private modalService = inject(BsModalService);
  private spinnerService = inject(NgxSpinnerService);
  private readonly spinnerName = 'doctor-list-spinner';
  private toastr = inject(ToastrService);
  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.spinnerService.show(this.spinnerName);
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.spinnerService.hide(this.spinnerName);
      },
      error: (err) => {
        this.spinnerService.hide(this.spinnerName);
        this.toastr.error(err);
      }
    });
  }

  openAddModal(): void {
    this.bsModalRef = this.modalService.show(DoctorFormModalComponent, {
      class: 'modal-dialog-centered',
      initialState: { doctor: null }
    });
    this.bsModalRef.content?.saved.subscribe(() => this.loadDoctors());
  }

  openEditModal(doctor: Doctor): void {
    this.bsModalRef = this.modalService.show(DoctorFormModalComponent, {
      class: 'modal-dialog-centered',
      initialState: { doctor }
    });
    this.bsModalRef.content?.saved.subscribe(() => this.loadDoctors());
  }

  async deleteDoctor(doctor: Doctor): Promise<void> {
    const confirmed = await this.confirmService.confirm(`Are you sure you want to delete "${doctor.name}"?`, 'Delete Doctor');
    if (!confirmed) return;

    this.spinnerService.show(this.spinnerName);
    this.doctorService.deleteDoctor(doctor.id).subscribe({
      next: () => {
        this.loadDoctors();
        this.spinnerService.hide(this.spinnerName);
        this.toastr.success('Doctor deleted successfully');
      },
      error: (err) => {
        this.spinnerService.hide(this.spinnerName);
        this.toastr.error(err);
      }
    });
  }
}
