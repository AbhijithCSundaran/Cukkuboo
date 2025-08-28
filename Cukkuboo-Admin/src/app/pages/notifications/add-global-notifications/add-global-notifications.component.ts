import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ValidationMessagesComponent } from '../../../core/components/validation-messsage/validaation-message.component';
import { NotificationService } from '../../../services/notification.service';
import { FileUploadService } from '../../../services/upload/file-upload.service';
import { HttpEventType } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-add-global-notifications',
  standalone: true,
  templateUrl: './add-global-notifications.component.html',
  styleUrls: ['./add-global-notifications.component.scss'],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatIconModule, MatSlideToggleModule,
    ValidationMessagesComponent
  ]
})
export class AddGlobalNotificationsComponent implements OnInit {
  public notificationId = 0;
  public notificationForm!: FormGroup;

  uploadProgress: number = 0;

confirmDeleteType: 'image' | null = null;

  // base url for uploaded images
  imgUrl: string = environment.fileUrl + 'uploads/images/';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService,
    private fileUploadService: FileUploadService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.notificationId = id ? +id : 0;
    this.initForm();

    if (this.notificationId) {
      this.loadNotification(this.notificationId);
    }

    // dynamically require schedule fields only when scheduled
    this.notificationForm.get('is_scheduled')?.valueChanges.subscribe((is) => {
      const dateCtrl = this.notificationForm.get('scheduled_date')!;
      const timeCtrl = this.notificationForm.get('scheduled_time_only')!;
      if (is) {
        dateCtrl.addValidators([Validators.required]);
        timeCtrl.addValidators([Validators.required, this.timeValidator]);
      } else {
        dateCtrl.clearValidators();
        timeCtrl.clearValidators();
        dateCtrl.setValue(null);
        timeCtrl.setValue('');
      }
      dateCtrl.updateValueAndValidity();
      timeCtrl.updateValueAndValidity();
    });
  }

  initForm() {
    this.notificationForm = this.fb.group({
      notification_id: [0],
      title: ['', Validators.required],
      content: ['', Validators.required],
      target: ['all', Validators.required],       // "all" | "free" | "premium"
      is_scheduled: [false],                       // boolean
      scheduled_date: [null],                      // Date
      scheduled_time_only: [''],                   // "HH:mm"
      type: ['global'],                            // constant
      image: ['']
    });
  }

  // loadNotification(id: number) {
  //   this.notificationService.getNotificationById(id).subscribe({
  //     next: (res) => {
  //       const data = res.data;
  //       this.notificationForm.patchValue(data);
  //     },
  //     error: () => {
  //       this.snackBar.open('Failed to load notification.', '', {
  //         duration: 3000,
  //         panelClass: ['snackbar-error']
  //       });
  //     }
  //   });
  // }
loadNotification(id: number) {
  this.notificationService.getNotificationById(id).subscribe({
    next: (res) => {
      const data = res.data;

      // Convert scheduled_time string into Date + Time
      if (data.scheduled_time) {
        const dt = new Date(data.scheduled_time);

        data.scheduled_date = dt; // Angular Material Datepicker expects a Date object
        data.scheduled_time_only = dt.toISOString().substring(11, 16); // HH:mm
        data.is_scheduled = data.is_scheduled === '1' ? true : false; // convert string -> boolean
      }

      this.notificationForm.patchValue(data);
    },
    error: () => {
      this.snackBar.open('Failed to load notification.', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  });
}

  private buildScheduledTimestamp(date: Date, hhmm: string): string {
    const [hh, mm] = hhmm.split(':');
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const H = String(+hh || 0).padStart(2, '0');
    const M = String(+mm || 0).padStart(2, '0');
    return `${y}-${m}-${d} ${H}:${M}:00`;
  }

  timeValidator(control: AbstractControl) {
    const v = control.value as string;
    if (!v) return null;
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v) ? null : { time: true };
  }

  // ================== IMAGE UPLOAD ==================
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.uploadImage(file);
    }
  }

  onImageDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onImageDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.uploadImage(file);
      }
    }
  }

  uploadImage(file: File) {
    this.uploadProgress = 0;
    this.fileUploadService.uploadImage(file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          if (event.body?.file_name) {
            this.notificationForm.patchValue({ image: event.body.file_name });
            this.snackBar.open('Image uploaded successfully!', '', {
              duration: 2000,
              panelClass: ['snackbar-success']
            });
          }
        }
      },
      error: () => {
        this.snackBar.open('Image upload failed', '', {
          duration: 2000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }


  openFullscreen(imgEl: HTMLImageElement) {
    if (imgEl.requestFullscreen) {
      imgEl.requestFullscreen();
    }
  }
  openDeleteConfirm(type: 'image'): void {
  this.confirmDeleteType = type;
}

cancelDelete(): void {
  this.confirmDeleteType = null;
}

confirmDelete(): void {
  if (this.confirmDeleteType === 'image') {
    this.notificationForm.patchValue({ image: '' });
    this.uploadProgress = 0;
    this.snackBar.open('Image deleted successfully.', '', {
      duration: 2000,
      panelClass: ['snackbar-success']
    });
  }
  this.cancelDelete();
}
  // SAVE
  saveNotification(): void {
    if (this.notificationForm.invalid) {
      this.notificationForm.markAllAsTouched();
      this.snackBar.open('Please fill all required fields.', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }

    const formValue = this.notificationForm.value;

    // Build scheduled datetime if needed
    let scheduled_datetime: string | null = null;
    if (formValue.is_scheduled && formValue.scheduled_date && formValue.scheduled_time_only) {
      scheduled_datetime = this.buildScheduledTimestamp(
        formValue.scheduled_date,
        formValue.scheduled_time_only
      );
    }

    // Build payload
    const payload: any = {
      notification_id: this.notificationId || 0,
      title: formValue.title,
      content: formValue.content,
      target: formValue.target,
      type: 'global',
      is_scheduled: formValue.is_scheduled ? 1 : 0,
      scheduled_time: scheduled_datetime,
      image: formValue.image || null
    };

    this.notificationService.saveNotification(payload).subscribe({
      next: () => {
        const message = this.notificationId
          ? 'Notification updated successfully!'
          : 'Notification saved successfully!';

        this.snackBar.open(message, '', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });

        this.router.navigate(['/notifications']);
      },
      error: () => {
        const message = this.notificationId
          ? 'Failed to update notification. Please try again.'
          : 'Failed to save notification. Please try again.';

        this.snackBar.open(message, '', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/notifications']);
  }
}
