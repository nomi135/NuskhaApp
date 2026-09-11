import { Component } from '@angular/core';
import { TabDirective, TabsModule } from 'ngx-bootstrap/tabs';
import { NgIf } from '@angular/common';
import { DiseaseManagementComponent } from "../disease-management/disease-management.component";
import { SymptomManagementComponent } from '../symptom-management/symptom-management.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [TabsModule, NgIf, DiseaseManagementComponent, SymptomManagementComponent],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent {
  activeTab?: TabDirective;

  onTabActivated(data: TabDirective) {
    this.activeTab = data;
  }
}
