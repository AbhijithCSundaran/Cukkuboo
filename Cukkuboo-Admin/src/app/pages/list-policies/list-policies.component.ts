import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PoliciesService } from '../../services/policies.service';

@Component({
  selector: 'app-list-policies',
  standalone: true,
  templateUrl: './list-policies.component.html',
  styleUrl: './list-policies.component.scss',
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule
  ]
})
export class ListPoliciesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['slNo', 'title', 'updatedOn', 'action'];
  dataSource = new MatTableDataSource<any>([]);
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;
  searchText = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private policiesService: PoliciesService) {}

  ngOnInit(): void {
    this.getPolicies();
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.getPolicies();
    });
  }

  getPolicies(): void {
    this.policiesService.listPolicies(this.pageIndex, this.pageSize, this.searchText).subscribe({
      next: (response) => {
        this.dataSource.data = response.data || [];
        this.totalItems = response.total || this.dataSource.data.length;
      },
      error: (error) => {
        console.error('Failed to load policies:', error);
        this.dataSource.data = [];
      }
    });
  }

  applyGlobalFilter(event: KeyboardEvent): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchText = value;
    this.pageIndex = 0; // Reset to first page
    this.getPolicies();
  }
}
