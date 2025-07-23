import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import {
  HttpClient,
  HttpClientModule
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

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.scss']
})
export class HelpCenterComponent {
  helpForm: FormGroup;
  loading = false;
  dragging = false;
  screenshots: File[] = [];

  countryCodes = ['+91', '+1', '+44', '+61', '+81', '+49'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.helpForm = this.fb.group({
      name: ['', Validators.required],
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
      this.helpForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const formData = new FormData();
    Object.entries(this.helpForm.value).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    this.screenshots.forEach(file => {
      formData.append('screenshots[]', file);
    });

    // Replace with your actual API endpoint
    this.http.post('https://example.com/api/help-center', formData).subscribe({
      next: () => {
        this.snackBar.open('Your issue has been submitted.', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.helpForm.reset({ countryCode: '+91' });
        this.screenshots = [];
      },
      error: () => {
        this.snackBar.open('Submission failed. Try again later.', 'Close', {
          duration: 3000,
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
