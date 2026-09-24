import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Country } from '../../_models/country';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CountryService } from '../../_services/country.service';
import { ToastrService } from 'ngx-toastr';
import { CountryFormModalComponent } from '../../modals/country-form-modal/country-form-modal.component';

@Component({
  selector: 'app-country-management',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule],
  templateUrl: './country-management.component.html',
  styleUrl: './country-management.component.scss'
})
export class CountryManagementComponent implements OnInit {
  countries: Country[] = [];
  bsModalRef?: BsModalRef;

  private countryService = inject(CountryService);
  private modalService = inject(BsModalService);
  private spinnerService = inject(NgxSpinnerService);
  private readonly spinnerName = 'country-list-spinner';
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(): void {
    this.spinnerService.show(this.spinnerName);
    this.countryService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
        this.spinnerService.hide(this.spinnerName);
      },
      error: (err) => {
        this.spinnerService.hide(this.spinnerName);
        this.toastr.error(err);
      }
    });
  }

  openAddModal(): void {
    this.bsModalRef = this.modalService.show(CountryFormModalComponent, {
      class: 'modal-dialog-centered',
      initialState: { country: null }
    });
    this.bsModalRef.content?.saved.subscribe(() => this.loadCountries());
  }

  openEditModal(country: Country): void {
    this.bsModalRef = this.modalService.show(CountryFormModalComponent, {
      class: 'modal-dialog-centered',
      initialState: { country }
    });
    this.bsModalRef.content?.saved.subscribe(() => this.loadCountries());
  }

  async deleteCountry(country: Country): Promise<void> {
    if (!confirm(`Are you sure you want to delete "${country.name}"?`)) return;

    this.spinnerService.show(this.spinnerName);
    this.countryService.deleteCountry(country.id).subscribe({
      next: () => {
        this.loadCountries();
        this.spinnerService.hide(this.spinnerName);
        this.toastr.success('Country deleted successfully');
      },
      error: (err) => {
        this.spinnerService.hide(this.spinnerName);
        this.toastr.error(err);
      }
    });
  }
}
