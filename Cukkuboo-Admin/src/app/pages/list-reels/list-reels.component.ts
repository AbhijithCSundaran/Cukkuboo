import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-list-reels',
  standalone: true,
  templateUrl: './list-reels.component.html',
  styleUrls: ['./list-reels.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class ListReelsComponent implements OnInit {
displayedColumns: string[] = ['slNo', 'title', 'access', 'likes', 'views', 'status', 'action'];
  dataSource = new MatTableDataSource<any>([]);
  confirmDeleteReel: any = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadReels();
  }

  loadReels(): void {
   const dummyData = [
  { id: 1, title: 'Reel 1', access: '1', status: '1', likes: 120, views: 540 },
  { id: 2, title: 'Reel 2', access: '2', status: '2', likes: 85, views: 320 },
  { id: 3, title: 'Reel 3', access: '1', status: '1', likes: 150, views: 780 }
];

    this.dataSource.data = dummyData;
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyGlobalFilter(event: KeyboardEvent): void {
    const input = (event.target as HTMLInputElement).value;
    this.dataSource.filter = input.trim().toLowerCase();
  }

  addNewReel(): void {
    this.router.navigate(['/add-reel']);
  }

  modalDeleteReel(reel: any): void {
    this.confirmDeleteReel = reel;
  }

  cancelDelete(): void {
    this.confirmDeleteReel = null;
  }

  confirmDelete(): void {
    const id = this.confirmDeleteReel?.id;
    if (id) {
      this.dataSource.data = this.dataSource.data.filter(r => r.id !== id);
    }
    this.confirmDeleteReel = null;
  }
}
