import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ValidationMessagesComponent } from '../../../core/components/validation-messsage/validaation-message.component';
import { ReelsService } from '../../../services/reels.service';
import { FileUploadService } from '../../../services/upload/file-upload.service';
@Component({
  selector: 'app-add-reels',
  imports: [
ValidationMessagesComponent,
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressBarModule
  ],
  templateUrl: './add-reels.component.html',
  styleUrls: ['./add-reels.component.scss']
})
export class AddReelsComponent implements OnInit {
  reelForm!: FormGroup;
  isEditMode = false;
  videoUrl: string = '';
  isVerticalVideo: boolean = false;
  confirmDeleteType: 'video' | 'thumbnail' | null = null;




  selectedReelFile: File | null = null;
  reelPreviewUrl: SafeUrl | null = null;
  thumbnailPreview: SafeUrl | null = null;
thumbnailFile: File | null = null;

  uploadInProgress = false;
  uploadProgress = 0;
  uploadError = '';
  isDragging = false;
  

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
     private reelsService: ReelsService,
      private fileUploadService: FileUploadService
  ) {}

  ngOnInit(): void {
    this.reelForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      releaseDate: ['', Validators.required],
      access: ['', Validators.required],
      status: ['', Validators.required],
      thumbnail: [null],
      views: [0],  
      likes: [0] 
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.handleFile(file);
    }
  }

 onVideoSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.handleFile(input.files[0]);
  }
}


 handleFile(file: File): void {
  if (!file.type.startsWith('video/')) {
    this.uploadError = 'Only video files are allowed.';
    return;
  }

  this.selectedReelFile = file;
  const objectUrl = URL.createObjectURL(file);
  this.reelPreviewUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
  this.uploadError = '';

  const video = document.createElement('video');
  video.src = objectUrl;
  video.onloadedmetadata = () => {
    this.isVerticalVideo = video.videoHeight > video.videoWidth;
  };
}


onThumbnailDragOver(event: DragEvent): void {
  event.preventDefault();
}

onThumbnailDrop(event: DragEvent): void {
  event.preventDefault();
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    this.handleThumbnailFile(file);
  }
}

onThumbnailSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.handleThumbnailFile(input.files[0]);
  }
}

handleThumbnailFile(file: File): void {
  if (!file.type.startsWith('image/')) {
    return;
  }

  this.thumbnailFile = file;
  const objectUrl = URL.createObjectURL(file);
  this.thumbnailPreview = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
  this.reelForm.patchValue({ thumbnail: file.name }); // Dummy value to trigger *ngIf
}
  openDeleteConfirm(type: 'video' | 'thumbnail'): void {
    this.confirmDeleteType = type;
  }

  confirmDelete(): void {
    if (this.confirmDeleteType === 'video') {
      this.selectedReelFile = null;
      this.reelPreviewUrl = null;
      this.uploadProgress = 0;
      this.uploadError = '';
    } else if (this.confirmDeleteType === 'thumbnail') {
      this.thumbnailFile = null;
      this.thumbnailPreview = null;
      this.reelForm.patchValue({ thumbnail: null });
    }

    this.confirmDeleteType = null;
  }

  cancelDelete(): void {
    this.confirmDeleteType = null;
  }
openFullscreen(element: HTMLElement): void {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if ((element as any).webkitRequestFullscreen) { /* Safari */
    (element as any).webkitRequestFullscreen();
  } else if ((element as any).msRequestFullscreen) { /* IE11 */
    (element as any).msRequestFullscreen();
  }
}

saveReel(): void {
  if (this.reelForm.invalid || !this.selectedReelFile) {
    this.uploadError = 'Please complete the form and select a video.';
    return;
  }

  const formData = new FormData();

  formData.append('title', this.reelForm.value.title);
  formData.append('description', this.reelForm.value.description);
  formData.append('releaseDate', this.reelForm.value.releaseDate);
  formData.append('access', this.reelForm.value.access);
  formData.append('status', this.reelForm.value.status);
  formData.append('video', this.selectedReelFile);
  formData.append('views', this.reelForm.value.views.toString());
  formData.append('likes', this.reelForm.value.likes.toString());

  if (this.thumbnailFile) {
    formData.append('thumbnail', this.thumbnailFile);
  }

  this.uploadInProgress = true;
  this.uploadProgress = 0;

  this.reelsService.addReels(formData).subscribe({
    next: (event: HttpEvent<any>) => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        this.uploadProgress = Math.round((event.loaded / event.total) * 100);
      } else if (event.type === HttpEventType.Response) {
        this.uploadProgress = 100;
        this.uploadInProgress = false;
        console.log('Upload complete:', event.body);
      }
    },
    error: (err) => {
      this.uploadInProgress = false;
      this.uploadError = 'Upload failed. Please try again.';
      console.error('Upload error:', err);
    }
  });
}





  goBack(): void {
    history.back();
  }
}
