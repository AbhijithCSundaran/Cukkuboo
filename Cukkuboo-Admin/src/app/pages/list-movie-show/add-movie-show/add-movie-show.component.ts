import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationMessagesComponent } from '../../../core/components/validation-messsage/validaation-message.component';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { FileUploadService } from '../../../services/upload/file-upload.service';
import { environment } from '../../../../environments/environment';
import { MovieService } from '../../../services/movie.service';
import { CommonService } from '../../../core/services/common.service';


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
  selector: 'app-add-movie-show',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatIconModule,
    MatCardModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule,
    MatProgressBarModule, MatCheckboxModule,
    FormsModule, RouterModule, ValidationMessagesComponent

  ],
  templateUrl: './add-movie-show.component.html',
  styleUrls: ['./add-movie-show.component.scss'],
  providers: [
          { provide: DateAdapter, useClass: CustomDateAdapter },
          { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
        ],
})
export class AddMovieShowComponent implements OnInit {
  movieForm!: FormGroup;
  isEditMode: boolean = false;
  Id: string | null = null;
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
  confirmDeleteType: string | null = null;


  videoUrl: string = environment.fileUrl + 'uploads/videos/'
  imgUrl: string = environment.fileUrl + 'uploads/images/'


  @ViewChild('videoInput') videoInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('trailerInput') trailerInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('thumbnailInput') thumbnailInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('bannerInput') bannerInputRef!: ElementRef<HTMLInputElement>;


  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute, private fb: FormBuilder,
    private fileUploadService: FileUploadService,
    private movieService: MovieService,
    private commonService: CommonService,
  ) { }


  ngOnInit(): void {
    this.movieForm = this.fb.group({
      mov_id: [0],
      title: ['', Validators.required],
      video: ['', Validators.required],
      trailer: ['', Validators.required],
      thumbnail: ['', Validators.required],
      banner: ['', Validators.required],
      genre: ['', ],
      description: ['', Validators.required],
      cast_details: ['', Validators.required],
      category: ['', ],
      release_date: ['', Validators.required],
      age_rating: ['', Validators.required],
      access: ['', Validators.required],
      status: ['', Validators.required],
      rating: [5,],

      duration: ['',],



    });


    const token = sessionStorage.getItem('token');
    console.log('Token from localStorage:', token);



    const id = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!id;
    if (id) {
      this.loadMovieData(Number(id));
    }
  }



  loadMovieData(id: number): void {
    this.movieService.getMovieById(id).subscribe({
      next: (response) => {
        const data = Array.isArray(response?.data) ? response.data[0] : response.data;
        debugger;
        if (data) {
          this.movieForm.patchValue({
            mov_id: data.mov_id,
            title: data.title,
            description: data.description,
            category: data.category,
            genre: data.genre,
            cast_details: data.cast_details,
            release_date: data.release_date,
            age_rating: data.age_rating,
            access: data.access,
            status: data.status,
            video: this.commonService.decryptData(data.video),
            trailer: this.commonService.decryptData(data.trailer),
            thumbnail: data.thumbnail,
            banner: data.banner,
            rating: data.rating,
            duration: data.duration
          });


          // this.trailerName = data.trailer ? data.trailer.split('/').pop() || '' : '';
          // this.trailerURL = data.trailer ? this.videoUrl + data.trailer : null;



          this.cdr.detectChanges();
        } else {
          console.warn('Movie not found for ID:', id);
        }
      },
      error: (error) => {
        console.error('Error fetching movie data:', error);
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
      this.uploadImage(file, this.movieForm.controls['thumbnail']);

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
      this.uploadImage(file, this.movieForm.controls['thumbnail']);
    }
  }



  uploadImage(file: File, control: AbstractControl | null = null, inProgress: boolean = true, progress: number = 0): void {
    inProgress = true;
    this.fileUploadService.uploadImage(file).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          progress = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response) {
          inProgress = false;
          progress = 100;
          this.showSnackbar('Image uploaded successfully!', 'snackbar-success');
          if (control && event.body?.file_name)
            control.setValue(event.body?.file_name)
          this.cdr.detectChanges();
        }
        console.log(this.uploadProgress)
      },
      error: (err) => {
        inProgress = false;
        progress = 0;
        console.error('Upload error:', err);
        this.showSnackbar('Image upload failed.', 'snackbar-error');
      }
    });
  }



  removeThumbnail(): void {
    this.thumbnailPreview = null;

    // Clear form control
    this.movieForm.controls['thumbnail'].setValue(null);
    this.movieForm.controls['thumbnail'].markAsDirty();
    this.movieForm.controls['thumbnail'].markAsTouched();

    // Reset file input
    if (this.thumbnailInputRef) {
      this.thumbnailInputRef.nativeElement.value = '';
    }

    this.cdr.detectChanges();
  }

  openFullscreen(element: any): void {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) { /* Safari */
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { /* IE11 */
      element.msRequestFullscreen();
    }
  }

onVideoSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (file) {
    const isMp4 = file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4');
    if (!isMp4) {
      this.showSnackbar('Only MP4 video files are allowed for videos.', 'snackbar-error');
      input.value = '';
      return;
    }

    this.videoName = file.name;
    this.videoURL = URL.createObjectURL(file);
    this.getVideoDuration(file); // 👈 Get duration before upload

    this.uploadMainVideo(file);
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

    this.videoName = file.name;
    this.videoURL = URL.createObjectURL(file);
    this.movieForm.controls['video'].setValue(this.videoURL);

    this.getVideoDuration(file); // 👈 Get duration before upload

    this.uploadMainVideo(file);
  }
}
getVideoDuration(file: File): void {
  const video = document.createElement('video');
  video.preload = 'metadata';

  video.onloadedmetadata = () => {
    window.URL.revokeObjectURL(video.src);
    const durationInSeconds = video.duration;

    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    const formattedDuration =
      hours > 0
        ? `${hours}h ${minutes}m ${seconds}s`
        : `${minutes}m ${seconds}s`;

    console.log('Video duration:', formattedDuration); // ✅ Console check

    this.movieForm.controls['duration'].setValue(formattedDuration);
    this.cdr.detectChanges();

    console.log('Form duration control value:', this.movieForm.value['duration']); // ✅ Form check
  };

  video.onerror = () => {
    this.showSnackbar('Unable to retrieve video duration.', 'snackbar-error');
  };

  video.src = URL.createObjectURL(file);
}


  uploadMainVideo(file: File) {
    this.uploadInProgress = true;
    this.uploadProgress = 0;
    this.videoName = file.name;
    this.uploadVideo(file, this.movieForm.controls['video'], this.uploadInProgress, "uploadProgress");
  }

  uploadVideo(file: File, control: AbstractControl | null = null, inProgress: boolean = true, progress: string = ''): void {
    inProgress = true;
    this.fileUploadService.uploadVideo(file).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          (this as any)[progress] = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response) {
          inProgress = false;
          (this as any)[progress] = 100;
          this.showSnackbar('Video uploaded successfully!', 'snackbar-success');
          if (control && event.body?.file_name)
            control.setValue(event.body?.file_name)
          this.cdr.detectChanges();
        }
        console.log(this.uploadProgress)
      },
      error: (err) => {
        inProgress = false;
        (this as any)[progress] = 0;
        console.error('Upload error:', err);
        this.showSnackbar('Video upload failed.', 'snackbar-error');
      }
    });
  }


  removeMainVideo(): void {
    this.videoName = '';
    this.videoURL = '';
    this.uploadProgress = 0;

    this.movieForm.controls['video'].setValue(null);
    this.movieForm.controls['video'].markAsDirty();
    this.movieForm.controls['video'].markAsTouched();

    // Reset file input
    if (this.videoInputRef) {
      this.videoInputRef.nativeElement.value = '';
    }

    // Trigger change detection
    this.cdr.detectChanges();
  }


  saveVideo(): void {
    // Add your saving logic here
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

      this.uploadImage(file, this.movieForm.controls['banner']);
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
      this.uploadImage(file, this.movieForm.controls['banner']);
    }
  }



  removeBanner(): void {
    this.bannerPreview = null;

    // Clear form control
    this.movieForm.controls['banner'].setValue(null);
    this.movieForm.controls['banner'].markAsDirty();
    this.movieForm.controls['banner'].markAsTouched();

    // Reset file input
    if (this.bannerInputRef) {
      this.bannerInputRef.nativeElement.value = '';
    }

    this.cdr.detectChanges();
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
      this.uploadVideo(file, this.movieForm.controls['trailer']);


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
      this.uploadVideo(file, this.movieForm.controls['trailer']);

      this.trailerName = file.name;
      this.trailerURL = URL.createObjectURL(file);

    }


  }

  onTrailerDragOver(event: DragEvent) {
    event.preventDefault();
  }


  //  removeTrailer(event: MouseEvent): void {
  // event.stopPropagation();  

  removeTrailer(): void {


    this.trailerURL = '';
    this.trailerName = '';


    this.movieForm.controls['trailer'].setValue(null);
    this.movieForm.controls['trailer'].markAsDirty();
    this.movieForm.controls['trailer'].markAsTouched();

    // Reset file input
    if (this.trailerInputRef) {
      this.trailerInputRef.nativeElement.value = '';
    }

    this.cdr.detectChanges();
  }

submitMovie() {
  if (this.movieForm.invalid) {
    this.movieForm.markAllAsTouched();
    this.snackBar.open('Please fill all required fields.', '', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
    return;
  }

  const model = this.movieForm.value;

  this.movieService.addmovies(model).subscribe({
    next: (response) => {
      console.log('Movie save response:', response); 
      const message = this.isEditMode ? 'Movie updated successfully!' : 'Movie saved successfully!';
      this.showSnackbar(message, 'snackbar-success');
      this.router.navigate(['/list-movie-show']);
    },
    error: () => {
      const errorMessage = this.isEditMode ? 'Failed to update movie. Please try again.' : 'Failed to save movie. Please try again.';
      this.showSnackbar(errorMessage, 'snackbar-error');
    }
  });
}






  openDeleteConfirm(type: string): void {
    this.confirmDeleteType = type;
  }

  confirmDelete(): void {
    if (!this.confirmDeleteType) return;

    switch (this.confirmDeleteType) {
      case 'video':
        this.removeMainVideo();
        break;
      case 'thumbnail':
        this.removeThumbnail();
        break;
      case 'trailer':
        this.removeTrailer();
        break;
      case 'banner':
        this.removeBanner();
        break;
    }
    this.cancelDelete();
  }

  // Cancel modal and reset
  cancelDelete(): void {
    this.confirmDeleteType = null;
  }

  capitalizeTitle() {
    const control = this.movieForm.controls['title'];
    const value = control.value;
    if (value && value.length > 0) {
      control.setValue(value.charAt(0).toUpperCase() + value.slice(1));
    }
  }

}


