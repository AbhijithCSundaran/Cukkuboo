import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoryService } from '../../services/category.service';

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
    MatPaginatorModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, AfterViewInit {
  categoryForm: FormGroup;
  isEditing = false;
  editCategoryId: string | null = null;
  isMobileView = false;
  categoryToDelete: any = null;

  displayedColumns: string[] = ['slNo', 'category_name', 'description', 'status', 'action'];
  dataSource = new MatTableDataSource<any>([]);

  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      status: ['1', Validators.required] 
    });
  }

  ngOnInit(): void {
    this.listCategories(this.pageIndex, this.pageSize);
    this.checkViewport();
    window.addEventListener('resize', this.checkViewport.bind(this));
  }

  ngAfterViewInit(): void {
    
  }

  checkViewport() {
    this.isMobileView = window.innerWidth <= 768;
  }

  listCategories(pageIndex: number = 0, pageSize: number = 10, searchText: string = '') {
    this.categoryService.listCategories(pageIndex, pageSize, searchText).subscribe({
      next: (res) => {
        const categories = res?.data || res || [];
        this.dataSource.data = categories;
        this.totalItems = res?.total || categories.length;
        this.pageIndex = pageIndex;
        this.pageSize = pageSize;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.showSnackbar('Failed to load categories.', 'snackbar-error');
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.listCategories(this.pageIndex, this.pageSize);
  }

  getSerialNumber(index: number): number {
    return this.pageIndex * this.pageSize + index + 1;
  }

  submitCategory() {
    if (this.categoryForm.invalid) return;

    const formValue = this.categoryForm.value;
    const model: any = {
      category_name: formValue.name,
      description: formValue.description,
      status: formValue.status
    };

    if (this.isEditing && this.editCategoryId) {
      model.category_id = this.editCategoryId;
    }

    this.categoryService.saveCategory(model).subscribe({
      next: () => {
        this.listCategories(this.pageIndex, this.pageSize);
        this.resetForm();
        const msg = this.isEditing ? 'Category updated successfully!' : 'Category added successfully!';
        this.showSnackbar(msg, 'snackbar-success');
      },
      error: (err) => {
        console.error('Error saving category:', err);
        const msg = this.isEditing ? 'Failed to update category.' : 'Failed to add category.';
        this.showSnackbar(msg, 'snackbar-error');
      }
    });
  }

  modalDeleteCategory(category: any) {
    this.categoryToDelete = category;
  }

  confirmDelete() {
    if (this.categoryToDelete) {
      this.deleteCategory(this.categoryToDelete.category_id);
      this.categoryToDelete = null;
    }
  }

  cancelDelete() {
    this.categoryToDelete = null;
  }

  deleteCategory(categoryId: any) {
    if (!categoryId) return;

    this.categoryService.deleteCategory(categoryId).subscribe({
      next: () => {
        this.listCategories(this.pageIndex, this.pageSize);
        this.resetForm();
        this.showSnackbar('Category deleted successfully!', 'snackbar-success');
      },
      error: (err) => {
        console.error('Error deleting category:', err);
        this.showSnackbar('Failed to delete category.', 'snackbar-error');
      }
    });
  }

  editCategory(categoryId: any) {
    const category = this.dataSource.data.find(cat => cat.category_id === categoryId);
    if (!category) return;

    this.categoryForm.patchValue({
      name: category.category_name,
      description: category.description,
      status: category.status
    });

    this.isEditing = true;
    this.editCategoryId = categoryId;
  }

  resetForm() {
    this.categoryForm.reset({ status: '1' });
    this.isEditing = false;
    this.editCategoryId = null;
  }

  showSnackbar(message: string, panelClass: string = 'snackbar-default'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }
}
