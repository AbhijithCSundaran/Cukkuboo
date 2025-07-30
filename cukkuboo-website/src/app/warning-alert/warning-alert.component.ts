import { Component } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-warning-alert',
  imports: [],
  templateUrl: './warning-alert.component.html',
  styleUrl: './warning-alert.component.scss'
})
export class WarningAlertComponent {

  constructor(
    public dialogRef: MatDialogRef<WarningAlertComponent >,
   
  ) {
  }
}
