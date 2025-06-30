import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  profileForm!: FormGroup;
  userId: number | null = null;

  constructor(private userService: UserService, private fb: FormBuilder, private snackBar: MatSnackBar,) { }

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
      next: (response) => {
        const data = response.data;
        this.userId = data.user_id;
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
  //update Profile
  onSubmit(): void {
    if (this.profileForm.valid) {
      const updatedData = {
        ...this.profileForm.value,
        user_id: this.userId
      };

      this.userService.register(updatedData).subscribe({
        next: (res) => {
          this.snackBar.open('Profile updated successfully.', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-success'] 
          });
        },
        error: (err) => {
          console.error('Error updating profile:', err);
          this.snackBar.open('Failed to update profile.', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error'] 
          });
        }
      });
    } else {
      console.warn('Form is invalid');
      this.snackBar.open('Please fill out all required fields.', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-warning']
      });
    }
  }






}
