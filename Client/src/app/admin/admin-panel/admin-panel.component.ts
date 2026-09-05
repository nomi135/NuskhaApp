import { Component } from '@angular/core';
import { TabDirective, TabsModule } from 'ngx-bootstrap/tabs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [TabsModule, NgIf],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent {
  activeTab?: TabDirective;

  onTabActivated(data: TabDirective) {
    this.activeTab = data;
  }
}
