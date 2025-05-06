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
  selector: 'app-categories',
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
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent {
  newCategory: string = '';
  newCategoryDescription: string = '';
  newCategoryStatus: string = 'enabled';
  isEditing: boolean = false;
  categoryToEdit: { name: string, description: string, status: string } | null = null;

  categories: { name: string, description: string, status: string }[] = [
    { name: 'Movies', description: 'Feature films and blockbusters', status: 'enabled' },
    { name: 'TV Shows', description: 'Series and episodes', status: 'enabled' },
    { name: 'Documentaries', description: 'Informative and factual content', status: 'disabled' }
  ];

  displayedColumns: string[] = ['name', 'description', 'status', 'action'];

  submitCategory() {
    const name = this.newCategory.trim();
    const description = this.newCategoryDescription.trim();
    const status = this.newCategoryStatus;

    if (!name) return;

    if (this.isEditing && this.categoryToEdit) {
      // Edit mode
      this.categoryToEdit.name = name;
      this.categoryToEdit.description = description;
      this.categoryToEdit.status = status;
    } else {
      // Add new category
      this.categories.push({ name, description, status });
    }

    this.categories = [...this.categories]; 
    this.resetForm();
  }

  deleteCategory(categoryToDelete: { name: string, description: string, status: string }) {
    this.categories = this.categories.filter(category => category !== categoryToDelete);
  }

 

  editCategory(category: { name: string, description: string, status: string }) {
    this.newCategory = category.name;
    this.newCategoryDescription = category.description;
    this.newCategoryStatus = category.status;
    this.isEditing = true;
    this.categoryToEdit = category;
  }

  resetForm() {
    this.newCategory = '';
    this.newCategoryDescription = '';
    this.newCategoryStatus = 'enabled';
    this.isEditing = false;
    this.categoryToEdit = null;
  }
}
