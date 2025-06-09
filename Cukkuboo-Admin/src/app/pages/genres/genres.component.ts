import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

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
    ReactiveFormsModule
  ],
  templateUrl: './genres.component.html',
  styleUrls: ['./genres.component.scss']
})
export class GenresComponent implements OnInit {
  genreForm!: FormGroup;
  isEditing = false;
  genreToEdit: { name: string; description: string; status: string } | null = null;

  genres = [
    { name: 'Action', description: 'High-energy scenes with fights, chases, and explosions', status: 'enabled' },
    { name: 'Comedy', description: 'Light-hearted content meant to entertain and amuse', status: 'enabled' },
    { name: 'Drama', description: 'Serious, plot-driven stories with emotional themes', status: 'disabled' }
  ];

  displayedColumns: string[] = ['slNo','name', 'description', 'status', 'action'];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.genreForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      status: ['enabled', Validators.required]
    });
  }

  submitGenre(): void {
    if (this.genreForm.invalid) return;

    const { name, description, status } = this.genreForm.value;

    if (this.isEditing && this.genreToEdit) {
      this.genreToEdit.name = name;
      this.genreToEdit.description = description;
      this.genreToEdit.status = status;
    } else {
      this.genres.push({ name, description, status });
    }

    this.genres = [...this.genres];
    this.resetForm();
  }

  deleteGenre(genreToDelete: { name: string; description: string; status: string }): void {
    this.genres = this.genres.filter(g => g !== genreToDelete);
  }

  editGenre(genre: { name: string; description: string; status: string }): void {
    this.genreForm.setValue({
      name: genre.name,
      description: genre.description,
      status: genre.status
    });
    this.isEditing = true;
    this.genreToEdit = genre;
  }

  resetForm(): void {
    this.genreForm.reset({ name: '', description: '', status: 'enabled' });
    this.isEditing = false;
    this.genreToEdit = null;
  }
}
