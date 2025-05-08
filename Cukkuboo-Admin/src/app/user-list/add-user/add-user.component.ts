import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';


@Component({
  selector: 'app-add-user',
  imports: [ MatFormFieldModule ,MatInputModule,MatCardModule,MatSelectModule, MatDatepickerModule,MatNativeDateModule ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent {

  constructor(private router: Router) {}

  saveUser(): void {
 
  }

  cancel(): void {
  
  }

  
  goBack(): void {
    this.router.navigate(['/list-movie-show']);
  }
}
