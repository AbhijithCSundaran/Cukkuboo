import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-genres',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatSelectModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './genres.component.html',
  styleUrls: ['./genres.component.scss']
})
export class GenresComponent {


  newGenre: string = '';
  newGenreDescription: string = '';
  newGenreStatus: string = 'enabled';
  isEditing: boolean = false;
  genreToEdit: { name: string, description: string, status: string } | null = null;

  genres: { name: string, description: string, status: string }[] = [
    { name: 'Action', description: 'High-energy scenes with fights, chases, and explosions', status: 'enabled' },
    { name: 'Comedy', description: 'Light-hearted content meant to entertain and amuse', status: 'enabled' },
    { name: 'Drama', description: 'Serious, plot-driven stories with emotional themes', status: 'disabled' }
  ];
  
  displayedColumns: string[] = ['name', 'description', 'status', 'action'];

  submitGenre() {
    const name = this.newGenre.trim();
    const description = this.newGenreDescription.trim();
    const status = this.newGenreStatus;

    if (!name) return;

    if (this.isEditing && this.genreToEdit) {
      // Edit mode
      this.genreToEdit.name = name;
      this.genreToEdit.description = description;
      this.genreToEdit.status = status;
    } else {
      // Add new category
      this.genres.push({ name, description, status });
    }

    this.genres = [...this.genres]; 
    this.resetForm();
  }

  deleteGenre(genreToDelete: { name: string, description: string, status: string }) {
    this.genres = this.genres.filter(genre => genre !== genreToDelete);
  }

 

  editGenre(genre: { name: string, description: string, status: string }) {
    this.newGenre = genre.name;
    this.newGenreDescription = genre.description;
    this.newGenreStatus = genre.status;
    this.isEditing = true;
    this.genreToEdit = genre;
  }

  resetForm() {
    this.newGenre = '';
    this.newGenreDescription = '';
    this.newGenreStatus = 'enabled';
    this.isEditing = false;
    this.genreToEdit = null;
  }

}
