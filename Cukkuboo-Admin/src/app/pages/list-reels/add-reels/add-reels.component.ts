import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationMessagesComponent } from '../../../core/components/validation-messsage/validaation-message.component';
import { ReelsService } from '../../../services/reels.service';
import { FileUploadService } from '../../../services/upload/file-upload.service';
import { environment } from '../../../../environments/environment';

export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const day = this._to2digit(date.getDate());
      const month = this._to2digit(date.getMonth() + 1);
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
    return super.format(date, displayFormat);
  }

  private _to2digit(n: number): string {
    return ('00' + n).slice(-2);
  }
}

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: { day: 'numeric', month: 'numeric', year: 'numeric' }
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};


@Component({
  selector: 'app-add-reels',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSnackBarModule,
    ValidationMessagesComponent
  ],
  templateUrl: './add-reels.component.html',
  styleUrls: ['./add-reels.component.scss'],
  providers: [
          { provide: DateAdapter, useClass: CustomDateAdapter },
          { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
        ],
})
export class AddReelsComponent implements OnInit {
  reelForm!: FormGroup;
  Id: string | null = null;
  isEditMode = false;
  selectedReelFile: File | null = null;
  thumbnailFile: File | null = null;
  reelPreviewUrl: SafeUrl | null = null;
  thumbnailPreview: SafeUrl | null = null;
  isVerticalVideo: boolean = false;
  confirmDeleteType: 'video' | 'thumbnail' | null = null;
  uploadInProgress = false;
  uploadProgress = 0;
  uploadError = '';
  isDragging = false;

  videoUrl: string = environment.fileUrl + 'uploads/videos/';
  imgUrl: string = environment.fileUrl + 'uploads/images/';

  @ViewChild('reelInput') reelInput!: ElementRef<HTMLInputElement>;
  @ViewChild('thumbnailInput') thumbnailInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private reelsService: ReelsService,
    private fileUploadService: FileUploadService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.reelForm = this.fb.group({
      reels_id: [0],
      title: ['', Validators.required],
      description: ['', Validators.required],
      release_date: ['', Validators.required],
      access: ['', Validators.required],
      status: ['', Validators.required],
      video: ['', Validators.required],
      thumbnail: ['', Validators.required],
      views: [0],
      likes: [0],
      created_by: ['']
      
    });

    const id = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!id;
    if (id) {
      this.loadReelData(Number(id));
    }
  }

  loadReelData(id: number): void {
    this.reelsService.getReelsById(id).subscribe({
      next: (response) => {
        const data = Array.isArray(response?.data) ? response.data[0] : response.data;
        this.reelForm.patchValue({
          reels_id: data.reels_id,
          title: data.title,
          description: data.description,
          release_date: data.release_date,
          access: data.access,
          status: data.status,
          thumbnail: data.thumbnail,
          video: data.video,
          views: data.views,
          likes: data.likes,
          created_by: data.created_by
        });

        if (data.thumbnail) {
          this.thumbnailPreview = this.sanitizer.bypassSecurityTrustUrl(data.thumbnail);
        }

        if (data.video) {
          this.reelPreviewUrl = this.sanitizer.bypassSecurityTrustUrl(data.video);
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching reel by ID:', err);
        this.showSnackbar('Failed to load reel data.', 'snackbar-error');
      }
    });
  }

  showSnackbar(message: string, panelClass: string = 'snackbar-default'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  uploadVideo(file: File, control: AbstractControl): void {
    this.uploadProgress = 0;
    this.uploadError = '';
    this.selectedReelFile = file;



    
    this.fileUploadService.uploadVideo(file).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.showSnackbar('Video uploaded successfully!', 'snackbar-success');
          if (control && event.body?.file_name) {
            control.setValue(event.body.file_name);
            this.reelPreviewUrl = this.sanitizer.bypassSecurityTrustUrl(this.videoUrl + event.body.file_name);
          }
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.uploadError = 'Upload failed. Please try again.';
        this.uploadProgress = 0;
        this.selectedReelFile = null;
        this.reelPreviewUrl = null;
        control.setValue(null);
        if (this.reelInput?.nativeElement) {
          this.reelInput.nativeElement.value = '';
        }
        this.showSnackbar('Video upload failed.', 'snackbar-error');
        this.cdr.detectChanges();
      }
    });
  }

  uploadImage(file: File, control: AbstractControl): void {
    this.fileUploadService.uploadImage(file).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.Response) {
          this.showSnackbar('Image uploaded successfully!', 'snackbar-success');

          if (control && event.body?.file_name) {
            control.setValue(event.body.file_name);
          }

          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Upload error:', err);
        this.thumbnailFile = null;
        this.thumbnailPreview = null;
        control.setValue(null);
        if (this.thumbnailInput?.nativeElement) {
          this.thumbnailInput.nativeElement.value = '';
        }
        this.showSnackbar('Image upload failed.', 'snackbar-error');
        this.cdr.detectChanges();
      }
    });
  }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.uploadVideo(file, this.reelForm.controls['video']);
    }
  }

  onVideoDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.uploadVideo(file, this.reelForm.controls['video']);
    }
  }

  onVideoDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onVideoDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onThumbnailSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.setThumbnailPreview(file);
      this.uploadImage(file, this.reelForm.controls['thumbnail']);
    }
  }

  onThumbnailDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.setThumbnailPreview(file);
      this.uploadImage(file, this.reelForm.controls['thumbnail']);
    }
  }

  onThumbnailDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  setThumbnailPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.thumbnailPreview = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  openDeleteConfirm(type: 'video' | 'thumbnail'): void {
    this.confirmDeleteType = type;
  }

  confirmDelete(): void {
    if (this.confirmDeleteType === 'video') {
      this.selectedReelFile = null;
      this.reelPreviewUrl = null;
      this.reelForm.patchValue({ video: null });
      this.uploadProgress = 0;
      this.uploadError = '';
      if (this.reelInput?.nativeElement) {
        this.reelInput.nativeElement.value = '';
      }
    } else if (this.confirmDeleteType === 'thumbnail') {
      this.thumbnailFile = null;
      this.thumbnailPreview = null;
      this.reelForm.patchValue({ thumbnail: null });
      if (this.thumbnailInput?.nativeElement) {
        this.thumbnailInput.nativeElement.value = '';
      }
    }

    this.confirmDeleteType = null;
  }

  cancelDelete(): void {
    this.confirmDeleteType = null;
  }

  openFullscreen(element: HTMLElement): void {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }
  }

saveReel(): void {
  if (this.reelForm.invalid || !this.reelForm.value['video']) {
    this.reelForm.markAllAsTouched();
    this.snackBar.open('Please fill all required fields.', '', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
    return;
  }

  const model = this.reelForm.value;
  this.uploadInProgress = true;

  this.reelsService.addReels(model).subscribe({
    next: (response) => {
      this.uploadInProgress = false;
      this.uploadProgress = 100;
      
      const message = this.isEditMode
        ? 'Reel updated successfully!'
        : 'Reel saved successfully!';

      this.snackBar.open(message, '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-success']
      });

      this.router.navigate(['/reels']);
    },
    error: (err) => {
      this.uploadInProgress = false;
      this.uploadError = 'Upload failed. Please try again.';
      
      const message = this.isEditMode
        ? 'Failed to update reel. Please try again.'
        : 'Failed to save reel. Please try again.';

      this.snackBar.open(message, '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    }
  });
}



  goBack(): void {
    history.back();
  }
}
