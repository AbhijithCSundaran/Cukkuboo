import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { HelpService } from '../../services/help.service';
import { FileUploadService } from '../../services/file-upload.service';
import { StorageService } from '../../core/services/TempStorage/storageService';
import countrycode from '../../../assets/json/countrycode.json';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ValidationService } from '../../core/services/validation.service';

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
  public countryCodes = countrycode;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private helpService: HelpService,
    private upload: FileUploadService,
    private storageService: StorageService
  ) {
    this.helpForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, ValidationService.emailValidator]],
      countryCode: ['+91', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{6,15}$/)]],
      issueType: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });

    const userData = this.storageService.getItem('userData');
    if (userData) {
      const rawPhone = userData.phone || '';
      if (rawPhone.includes('-')) {
        const [code, number] = rawPhone.split('-');
        this.helpForm.patchValue({
          name: userData.username || '',
          email: userData.email || '',
          countryCode: code || '+91',
          phone: number || ''
        });
      } else {
        this.helpForm.patchValue({
          name: userData.username || '',
          email: userData.email || '',
          countryCode: userData.countryCode || '+91',
          phone: rawPhone
        });
      }
    }
  }

  submitIssue(): void {
    if (this.helpForm.invalid) {
      this.helpForm.markAllAsTouched();
      this.snackBar.open('Please fill all required fields', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }


    this.loading = true;
    const formData = this.helpForm.value;

    const submitFinalRequest = (screenshotFileName: string = '') => {
      const data = {
        name: formData.name,
        email: formData.email,
        phone: `${formData.countryCode}-${formData.phone}`,
        issue_type: formData.issueType,
        description: formData.description,
        screenshot: screenshotFileName
      };

      this.helpService.submitHelpRequest(data).subscribe({
        next: (res) => {
          if (res?.success) {
            this.snackBar.open(res.message || 'Issue submitted successfully!', '', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            });

            // Clear only issueType and description
            this.helpForm.get('issueType')?.reset('', { emitEvent: false });
            this.helpForm.get('description')?.reset('', { emitEvent: false });

            // Mark all controls as untouched (to hide validation errors)
            Object.keys(this.helpForm.controls).forEach(field => {
              const control = this.helpForm.get(field);
              control?.markAsUntouched();
            });

            // Clear screenshot
            this.screenshots = [];
          } else {
            this.snackBar.open(res?.message || 'Submission failed.', '', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['snackbar-error']
            });
          }

          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Failed to submit issue.', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
          this.loading = false;
        }
      });
    };

    if (this.screenshots.length > 0) {
      const file = this.screenshots[0];
      this.upload.uploadImage(file).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.Response) {
            const res = event.body as any;
            if (res?.success && res?.file_name) {
              submitFinalRequest(res.file_name);
            } else {
              this.snackBar.open('Image upload failed.', '', {
                duration: 3000,
                verticalPosition: 'top',
                panelClass: ['snackbar-error']
              });
              this.loading = false;
            }
          }
        },
        error: () => {
          this.snackBar.open('Error uploading image.', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
          this.loading = false;
        }
      });
    } else {
      submitFinalRequest();
    }
  }

  filePreview(file: File): string {
    return URL.createObjectURL(file);
  }

  removeScreenshot(file: File): void {
    this.screenshots = this.screenshots.filter(f => f !== file);
  }

  onNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.helpForm.get('phone')?.setValue(input.value, { emitEvent: false });
  }

  forceLowerCaseEmail(): void {
    const emailControl = this.helpForm.get('email');
    const value = emailControl?.value || '';
    if (value !== value.toLowerCase()) {
      emailControl?.setValue(value.toLowerCase(), { emitEvent: false });
    }
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
        this.screenshots = [file]; // Only 1 allowed
      } else {
        this.snackBar.open(`Invalid file type: ${file.name}`, 'Close', {
          duration: 2000,
          panelClass: ['snackbar-error']
        });
      }
    }
  }

  openFullscreen(file: File): void {
    const img = new Image();
    img.src = this.filePreview(file);
    const newWindow = window.open('');
    if (newWindow) {
      newWindow.document.write(`<img src="${img.src}" style="width: 100%; height: auto;" />`);
      newWindow.document.title = 'Screenshot Preview';
    } else {
      this.snackBar.open('Popup blocked! Please allow popups for this site.', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    }
  }
  goBack(): void {
    window.history.back();
  }
}
