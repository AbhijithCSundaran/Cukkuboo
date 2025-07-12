import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-confirm-plan',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './confirm-plan.component.html',
  styleUrl: './confirm-plan.component.scss'
})
export class ConfirmPlanComponent {
  acknowledged: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ConfirmPlanComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
  ) {

  }
  confirm(): void {
    if (!this.acknowledged) {
      this.snackBar.open('Please read and acknowledge our Privacy Policy & Terms of Use.', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['snackbar-warn']
      });
    }
    else
      this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

}
