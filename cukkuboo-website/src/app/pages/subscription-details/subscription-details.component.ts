import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/TempStorage/storageService';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-subscription-details',
  imports: [
    CommonModule,
  ],
  templateUrl: './subscription-details.component.html',
  styleUrl: './subscription-details.component.scss'
})
export class SubscriptionDetailsComponent   {

    constructor(private userService: UserService, sessionService: StorageService) {}

}
