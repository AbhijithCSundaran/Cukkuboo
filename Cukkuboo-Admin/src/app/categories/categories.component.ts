import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent {
  categoryForm: FormGroup;
  isEditing: boolean = false;
  categoryToEditIndex: number | null = null;

  categories: { name: string, description: string, status: string }[] = [
    { name: 'Movies', description: 'Feature films and blockbusters', status: 'enabled' },
    { name: 'TV Shows', description: 'Series and episodes', status: 'enabled' },
    { name: 'Documentaries', description: 'Informative and factual content', status: 'disabled' }
  ];

  displayedColumns: string[] = ['name', 'description', 'status', 'action'];

  constructor(private fb: FormBuilder) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      status: ['enabled', Validators.required]
    });
  }

  submitCategory() {
    if (this.categoryForm.invalid) return;

    const formValue = this.categoryForm.value;

    if (this.isEditing && this.categoryToEditIndex !== null) {
      this.categories[this.categoryToEditIndex] = { ...formValue };
    } else {
      this.categories.push(formValue);
    }

    this.categories = [...this.categories];
    this.resetForm();
  }

  deleteCategory(index: number) {
    this.categories.splice(index, 1);
    this.categories = [...this.categories];
    this.resetForm();
  }

  editCategory(index: number) {
    const category = this.categories[index];
    this.categoryForm.patchValue(category);
    this.isEditing = true;
    this.categoryToEditIndex = index;
  }

  resetForm() {
    this.categoryForm.reset({ status: 'enabled' });
    this.isEditing = false;
    this.categoryToEditIndex = null;
  }
}
