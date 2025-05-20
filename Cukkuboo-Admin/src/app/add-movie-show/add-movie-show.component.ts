import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-add-movie-show',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressBarModule,
    MatCheckboxModule,
    FormsModule
  ],
  templateUrl: './add-movie-show.component.html',
  styleUrls: ['./add-movie-show.component.css']
})
export class AddMovieShowComponent implements OnInit {
  movieForm!: FormGroup;
  isEditMode: boolean = false; 
  movieShowId: string | null = null;
  thumbnailPreview: string | ArrayBuffer | null = null;
  bannerPreview: string | ArrayBuffer | null = null;
  videoName: string | null = null;
  videoURL: string | null = null;
  uploadProgress = 0;
  uploadInProgress = false;
  autoSave = false;
  trailerName = '';
  trailerURL: string | null = null;
  accessType: 'free' | 'standard' | 'premium' | null = null;
  status: 'active' | 'inactive' | null = null;
  videoInput!: HTMLInputElement;
  isVerticalVideo = false;
  



  @ViewChild('videoInput') videoInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('trailerInput') trailerInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('thumbnailInput') thumbnailInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('bannerInput') bannerInputRef!: ElementRef<HTMLInputElement>;


  constructor(private router: Router, private snackBar: MatSnackBar,
    private route: ActivatedRoute,private fb: FormBuilder) { }


    ngOnInit(): void {
      this.movieForm = this.fb.group({
        title: ['', Validators.required],
        genre: ['', Validators.required],
        description: ['', Validators.required],
        cast: ['', Validators.required],
        category: ['', Validators.required],
        releaseDate: ['', Validators.required],
        rating: ['', Validators.required],
        access: ['', Validators.required],
        status: ['', Validators.required]
      });


       // Check if we're in edit mode (i.e., we have an ID in the route)
    this.movieShowId = this.route.snapshot.paramMap.get('id');
    if (this.movieShowId) {
      this.isEditMode = true;
      // Load movie/show data for editing based on the ID
    }
    }


  showSnackbar(message: string, panelClass: string = 'snackbar-default'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }
  

  onThumbnailSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const isJpeg = file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg');
      if (!isJpeg) {
        this.showSnackbar('Only JPEG image files are allowed for thumbnails.', 'snackbar-error');
        input.value = '';
        return;
      }

      this.readThumbnailFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];

    if (file) {
      const isJpeg = file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg');
      if (!isJpeg) {
        this.showSnackbar('Only JPEG image files are allowed for thumbnails.', 'snackbar-error');
        return;
      }
      this.readThumbnailFile(file);
    }
  }

  private readThumbnailFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.thumbnailPreview = e.target?.result ?? null;
    };
    reader.readAsDataURL(file);
  }

  removeThumbnail(): void {
    debugger;
    this.thumbnailPreview = null;

    // Reset file input
    if (this.thumbnailInputRef) {
      this.thumbnailInputRef.nativeElement.value = '';
    }
  }


  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const isMp4 = file.type === 'video/mp4';
      if (!isMp4) {
        this.showSnackbar('Only MP4 video files are allowed for videos.', 'snackbar-error');
        input.value = '';
        return;
      }

      this.simulateUpload(file);
    }
  }

  onVideoDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onVideoDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];

    if (file) {
      const isMp4 = file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4');
      if (!isMp4) {
        this.showSnackbar('Only MP4 video files are allowed for videos.', 'snackbar-error');
        return;
      }
      this.simulateUpload(file);
    }
  }

  simulateUpload(file: File): void {
    this.videoName = file.name;
    this.uploadInProgress = true;
    this.uploadProgress = 0;

    const reader = new FileReader();
    reader.onload = () => {
      this.videoURL = reader.result as string;
    };
    reader.readAsDataURL(file);

    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.uploadInProgress = false;
        if (this.autoSave) this.saveVideo();
      }
    }, 200);
  }

  removeMainVideo(): void {
    this.videoName = '';
    this.videoURL = '';
    this.uploadProgress = 0;

    // Reset file input
    if (this.videoInputRef) {
      this.videoInputRef.nativeElement.value = '';
    }
  }

  saveVideo(): void {
    // Add your saving logic here
  }


  onVideoMetadataLoaded(event: Event) {
    const video = event.target as HTMLVideoElement;
    if (video.videoHeight > video.videoWidth) {
      this.isVerticalVideo = true;  // portrait
    } else {
      this.isVerticalVideo = false; // landscape
    }
  }


  onBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const isJpeg = file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg');
      if (!isJpeg) {
        this.showSnackbar('Only JPEG image files are allowed for banners.', 'snackbar-error');
        input.value = '';
        return;
      }

      this.readBannerFile(file);
    }
  }

  onBannerDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];

    if (file) {
      const isJpeg = file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg');
      if (!isJpeg) {
        this.showSnackbar('Only JPEG image files are allowed for banners.', 'snackbar-error');
        return;
      }
      this.readBannerFile(file);
    }
  }

  private readBannerFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.bannerPreview = e.target?.result ?? null;
    };
    reader.readAsDataURL(file);
  }

  removeBanner(): void {
    this.bannerPreview = null;

    // Reset file input
    if (this.bannerInputRef) {
      this.bannerInputRef.nativeElement.value = '';
    }
  }

  onTrailerSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const isMp4 = file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4');
      if (!isMp4) {
        this.showSnackbar('Only MP4 video files are allowed for trailers.', 'snackbar-error');
        input.value = '';
        return;
      }

      this.trailerName = file.name;
      this.trailerURL = URL.createObjectURL(file);
    }
  }

  onTrailerDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];

    if (file) {
      const isMp4 = file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4');
      if (!isMp4) {
        this.showSnackbar('Only MP4 video files are allowed for trailers.', 'snackbar-error');
        return;
      }
      this.trailerName = file.name;
      this.trailerURL = URL.createObjectURL(file);
    }
  }

  onTrailerDragOver(event: DragEvent) {
    event.preventDefault();
  }

  removeTrailer(event: MouseEvent): void {
    event.stopPropagation();  // Prevents the click event from propagating to the parent
    this.trailerURL = '';
    this.trailerName = '';
    this.uploadProgress = 0;

    // Reset file input
    if (this.trailerInputRef) {
      this.trailerInputRef.nativeElement.value = '';
    }
  }




  goBack(): void {
    this.router.navigate(['/list-movie-show']);
  }

  submitForm(): void {
    if (this.movieForm.invalid) {
      this.movieForm.markAllAsTouched();
      return;
    }

    const formData = {
      ...this.movieForm.value,
      videoName: this.videoName,
      thumbnail: this.thumbnailPreview,
      trailer: this.trailerURL,
      banner: this.bannerPreview
    };

  }
}
