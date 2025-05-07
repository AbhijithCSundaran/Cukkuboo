import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';



@Component({
  selector: 'app-user-list',
  imports: [MatTableModule, CommonModule, MatIconModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  // changeDetection:ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit {

  constructor(private router: Router,
    private cdr:ChangeDetectorRef
  ) { }

  displayedColumns: string[] = ['name', 'contact', 'email', 'country', 'status', 'joindate', 'subscription', 'action'];


  users = [
    {
      name: 'John Doe',
      contact: '123-456-7890',
      email: 'john@example.com',
      country: 'USA',
      status: 'active',
      joindate: new Date('2023-05-01'),
      subscription: 'Premium'
    },
    {
      name: 'Jane Smith',
      contact: '987-654-3210',
      email: 'jane@example.com',
      country: 'UK',
      status: 'inactive',
      joindate: new Date('2024-01-15'),
      subscription: 'Basic'
    }

  ];


  dataSource = new MatTableDataSource(this.users);

  ngOnInit(): void { }

  editUser(user: any): void {

    this.router.navigate(['//add-user'], {

    });
  }

  deleteUser(user: any): void {
    debugger;
    const index = this.users.indexOf(user);
    if (index > -1) {
      this.users.splice(index, 1);
      this.dataSource.data = [...this.users];
      // this.dataSource = new MatTableDataSource(structuredClone(this.users));
      this.cdr.detectChanges();

    }
  }


  addNewUser(): void {
    // this.router.navigate(['/add-user']);
    this.users.push({
      name: 'Jane Smith',
      contact: '987-654-3210',
      email: 'jane@example.com',
      country: 'UK',
      status: 'inactive',
      joindate: new Date('2024-01-15'),
      subscription: 'Basic'
    })
  }
}
