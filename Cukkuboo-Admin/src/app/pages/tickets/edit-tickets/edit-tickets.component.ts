import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ValidationService } from '../../../core/services/validation.service';
import { TicketsService } from '../../../services/tickets.service';
import { environment } from '../../../../environments/environment';

import countrycode from '.../../../src/assets/json/countrycode.json';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-edit-ticket',
  templateUrl: './edit-tickets.component.html',
  standalone: true,
  styleUrls: ['./edit-tickets.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
})
export class EditTicketsComponent implements OnInit {
  public ticketForm!: FormGroup;
  public ticketId: number = 0;

  public countryCodes = countrycode;
  public selectedCountryCode: string = '+91';

  imageUrl = environment.fileUrl + 'uploads/images/';
  public screenshotUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private ticketService: TicketsService
  ) {}

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    this.ticketId = id ? +id : 0;

    if (this.ticketId > 0) {
      this.loadTicketData(this.ticketId);
    }
  }

  private initForm(): void {
    this.ticketForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, ValidationService.emailValidator]],
      countryCode: [this.selectedCountryCode, Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{6,15}$/)]],
      issue_type: ['', Validators.required],
      description: ['', Validators.required],
      status: ['1', Validators.required],
    });
  }

  private loadTicketData(id: number): void {
    this.ticketService.getTicketById(id).subscribe({
      next: (response) => {
        const ticket = response?.data;
        if (ticket) {
          const {
            name,
            email,
            phone,
            description,
            status,
            issue_type,
            screenshot,
          } = ticket;

          const countryCode = this.extractCountryCode(phone);
          const phoneWithoutCode = phone?.replace(countryCode, '') || '';

          this.ticketForm.patchValue({
            name: name || '',
            email: email || '',
            countryCode: countryCode || this.selectedCountryCode,
            phone: phoneWithoutCode,
            issue_type: issue_type || '',
            description: description || '',
            status: status?.toString() || '1',
          });

          this.screenshotUrl = screenshot ? this.imageUrl + screenshot : '';
        }
      },
      error: () => {
        this.showSnackbar('Failed to fetch ticket details.', 'error');
      },
    });
  }

  extractCountryCode(fullPhone: string): string {
    for (let country of this.countryCodes) {
      if (fullPhone?.startsWith(country.dial_code)) {
        return country.dial_code;
      }
    }
    return this.selectedCountryCode;
  }

  saveTicket(): void {
    const statusControl = this.ticketForm.get('status');

    if (!statusControl || statusControl.invalid) {
      this.showSnackbar('Please select a valid status.', 'error');
      return;
    }

    const payload = {
      support_id: this.ticketId,
      status: statusControl.value,
    };

    this.ticketService.editstatus(payload).subscribe({
      next: (response) => {
        if (response?.success) {
          this.showSnackbar(response.message || 'Ticket updated successfully.', 'success');
          this.router.navigate(['/tickets']);
        } else {
          this.showSnackbar(response?.message || 'Failed to update ticket.', 'error');
        }
      },
      error: (err) => {
        this.showSnackbar('Error occurred while updating ticket.', 'error');
        console.error(err);
      },
    });
  }

  openFullScreen(): void {
    const img = new Image();
    img.src = this.screenshotUrl;
    const newWindow = window.open('');
    if (newWindow) {
      newWindow.document.write(`<img src="${img.src}" style="width: 100%; height: auto;" />`);
      newWindow.document.title = 'Screenshot Preview';
    } else {
      this.showSnackbar('Popup blocked! Please allow popups for this site.', 'error');
    }
  }

  goBack(): void {
    this.router.navigate(['/tickets']);
  }

  //  Snackbar helper method
  showSnackbar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error',
    });
  }
}
