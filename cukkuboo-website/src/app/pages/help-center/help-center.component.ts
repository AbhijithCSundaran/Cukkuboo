import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import {
  HttpClient
} from '@angular/common/http';
import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import countrycode from '../../../assets/json/countrycode.json';
import { HelpService } from '../../services/help.service';
import { FileUploadService } from '../../services/file-upload.service';


@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.scss']
})
export class HelpCenterComponent {
  helpForm: FormGroup;
  loading = false;
  dragging = false;
  screenshots: File[] = [];
  countryCodes = countrycode;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private helpService: HelpService,
     private upload: FileUploadService

  ) {
    this.helpForm = this.fb.group({
      // name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['+91', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      issueType: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  forceLowerCaseEmail(): void {
    const emailControl = this.helpForm.get('email');
    const currentValue = emailControl?.value || '';
    const lowerCased = currentValue.toLowerCase();
    if (currentValue !== lowerCased) {
      emailControl?.setValue(lowerCased, { emitEvent: false });
    }
  }

submitIssue(): void {
  if (this.helpForm.invalid) {
    this.snackBar.open('Please fill out the form correctly.', '', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
    return;
  }

  this.loading = true;

  const formData = {
    // name: this.helpForm.value.name,
    email: this.helpForm.value.email.toLowerCase(),
    country_code: this.helpForm.value.countryCode,
    phone: this.helpForm.value.phone,
    issue_type: this.helpForm.value.issueType,
    message: this.helpForm.value.message
  };

  this.helpService.submitHelpRequest(formData).subscribe({
    next: (res) => {
      if (res?.success) {
        this.snackBar.open('Issue submitted successfully!', '', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });
        this.helpForm.reset({ countryCode: '+91' });
        this.screenshots = [];
      } else {
        this.snackBar.open(res?.message || 'Submission failed.', '', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    },
    error: (err) => {
      console.error('Error submitting issue:', err);
      this.snackBar.open('Failed to submit issue.', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    },
    complete: () => {
      this.loading = false;
    }
  });
}


  onNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
    if (event.dataTransfer?.files) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(input.files);
    }
  }

  addFiles(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        this.screenshots.push(file);
      } else {
        this.snackBar.open(`Invalid file type: ${file.name}`, 'Close', {
          duration: 2000,
          panelClass: ['snackbar-error']
        });
      }
    }
  }

  goBack(): void {
    window.history.back();
  }
}
