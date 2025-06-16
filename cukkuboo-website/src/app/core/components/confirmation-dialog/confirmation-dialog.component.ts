import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class ConfirmationDialogComponent {
  dontShowAgain: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { heading: string, message: string, askToHide: boolean, model: any },
  ) {

  }

  // Close the dialog with true (meaning confirm navigation)
  confirm(): void {
    const result = this.data.askToHide ? { dontShowAgain: this.dontShowAgain, confirm: true } : true;
    this.dialogRef.close(result);
  }

  // Close the dialog with false (meaning cancel navigation)
  cancel(): void {
    const result = this.data.askToHide ? { dontShowAgain: this.dontShowAgain, confirm: false } : false;
    this.dialogRef.close(result);
  }
}
