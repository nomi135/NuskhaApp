import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss'
})
export class ConfirmModalComponent {
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone.';
  @Input() confirmText = 'Delete';
  @Input() confirmClass = 'btn-danger';
  confirmed = new Subject<boolean>();
  public bsModalRef = inject(BsModalRef);

  confirm(): void {
    this.confirmed.next(true);
    this.bsModalRef.hide();
  }

  cancel(): void {
    this.confirmed.next(false);
    this.bsModalRef.hide();
  }
}
