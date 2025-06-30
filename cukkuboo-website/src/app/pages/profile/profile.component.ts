import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-profile',
  imports: [
     ReactiveFormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit{

  profileForm! : FormGroup;
    constructor(private userService: UserService, private fb: FormBuilder) {}

ngOnInit(): void {

  this.profileForm = this.fb.group({
    username: [''],
    email: [''],
    phone: [''],
  
  });

  this.loadUserData();
}

loadUserData(): void {
  this.userService.getProfile().subscribe({
    next: (data) => {
      this.profileForm.patchValue({
        username: data.username,
        email: data.email,
        phone: data.phone,
       
      });
    },
    error: (err) => {
      console.error('Error fetching profile', err);
    }
  });
}

}
