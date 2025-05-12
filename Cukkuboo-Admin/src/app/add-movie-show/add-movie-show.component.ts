import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
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




@Component({
  selector: 'app-add-movie-show',
  standalone: true,
  imports: [
    CommonModule,               
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
  styleUrl: './add-movie-show.component.css'
})
export class AddMovieShowComponent {
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


  constructor(private router: Router) {}


  onThumbnailSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.readThumbnailFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files.length) {
      this.readThumbnailFile(event.dataTransfer.files[0]);
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
    this.thumbnailPreview = null;
  }

 
  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.simulateUpload(input.files[0]);
    }
  }

  onVideoDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onVideoDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files.length) {
      this.simulateUpload(event.dataTransfer.files[0]);
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

  saveVideo(): void {
 
  }


  onBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.readBannerFile(input.files[0]);
    }
  }

  onBannerDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files.length) {
      this.readBannerFile(event.dataTransfer.files[0]);
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
  }


  onTrailerSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.trailerName = file.name;
      this.trailerURL = URL.createObjectURL(file);
     
    }
  }
  
  onTrailerDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.trailerName = file.name;
      this.trailerURL = URL.createObjectURL(file);
     
    }
  }
  
  onTrailerDragOver(event: DragEvent) {
    event.preventDefault();
  }
  
  removeMainVideo() {
    this.videoURL = '';
    this.videoName = '';
    this.uploadProgress = 0;
  }
  
  removeTrailer() {
    this.trailerURL = '';
    this.trailerName = '';
  }
  

 goBack(): void {
    this.router.navigate(['/list-movie-show']);
  }

 
  submitForm(): void {
   
  }
}