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
  videoName: string | null = null;
  videoURL: string | null = null;
  uploadProgress = 0;
  uploadInProgress = false;
  autoSave = false;
  

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
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.readThumbnailFile(event.dataTransfer.files[0]);
    }
  }

  private readThumbnailFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.thumbnailPreview = reader.result;
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
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
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
        if (this.autoSave) {
          this.saveVideo();
        }
      }
    }, 200);
  }

  saveVideo(): void {
    console.log('Video saved:', this.videoName);
  }

  submitForm(): void {
    console.log('Form submitted');
  }
}
