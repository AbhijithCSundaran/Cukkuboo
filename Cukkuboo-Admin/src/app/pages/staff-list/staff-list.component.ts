import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [
    MatInputModule ,
    MatFormFieldModule,
    CommonModule,
    RouterLink,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule
  ],
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.scss']
})
export class StaffListComponent implements OnInit {
  displayedColumns: string[] = ['slNo','name', 'role', 'email', 'phone', 'status', 'joiningDate', 'action'];

  staffMembers = [
    {
      id: 1,
      name: 'Alice Johnson',
      role: 'Admin',
      email: 'alice@example.com',
      phone: '555-123-4567',
      status: 'active',
      joiningDate: new Date('2022-04-10')
    },
    {
      id: 2,
      name: 'Bob Lee',
     role: 'Manager',
      email: 'bob@example.com',
      phone: '555-987-6543',
      status: 'inactive',
      joiningDate: new Date('2021-11-01')
    }
  ];

  dataSource = new MatTableDataSource(this.staffMembers);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;


     

  this.dataSource.filterPredicate = (data: any, filter: string) => {
    const dataStr = `${data.name} ${data.role} ${data.email} ${data.phone} ${data.status}`
      .toLowerCase();
    return dataStr.includes(filter);
  };
  }

  deleteStaff(staff: any): void {
    const index = this.staffMembers.indexOf(staff);
    if (index > -1) {
      this.staffMembers.splice(index, 1);
      this.dataSource.data = [...this.staffMembers];
    }
  }


 
  editStaff(staff: any): void {

    this.router.navigate(['/add-staff'], {

    });
  }




  applyGlobalFilter(event: KeyboardEvent): void {
    const input = (event.target as HTMLInputElement).value;
    this.dataSource.filter = input.trim().toLowerCase();
  }
  addNewStaff(): void {
    this.router.navigate(['/add-staff']);
  }
}
