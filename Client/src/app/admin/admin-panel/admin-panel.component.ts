import { Component } from '@angular/core';
import { TabDirective, TabsModule } from 'ngx-bootstrap/tabs';
import { NgIf } from '@angular/common';
import { DiseaseManagementComponent } from "../disease-management/disease-management.component";
import { SymptomManagementComponent } from '../symptom-management/symptom-management.component';
import { MedicineManagementComponent } from '../medicine-management/medicine-management.component';
import { DoctorManagementComponent } from '../doctor-management/doctor-management.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [TabsModule, NgIf, DiseaseManagementComponent, SymptomManagementComponent, DoctorManagementComponent, MedicineManagementComponent],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent {
  activeTab?: TabDirective;

  onTabActivated(data: TabDirective) {
    this.activeTab = data;
  }
}
