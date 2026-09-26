import { inject, Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmModalComponent } from '../_shared/confirm-modal/confirm-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private modalService = inject(BsModalService);

  confirm(
    message: string,
    title = 'Are you sure?',
    confirmText = 'Delete',
    confirmClass = 'btn-danger'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const bsModalRef = this.modalService.show(ConfirmModalComponent, {
        class: 'modal-dialog-centered',
        initialState: { title, message, confirmText, confirmClass }
      });

      bsModalRef.content?.confirmed.subscribe((result: boolean) => resolve(result));
    });
  }
}
