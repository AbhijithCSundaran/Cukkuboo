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
        this.snackBar.open('Failed to fetch ticket details.', '', {
          duration: 3000,
        });
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
      this.snackBar.open('Please select a valid status.', '', { duration: 3000 });
      return;
    }

    const payload = {
      support_id: this.ticketId,
      status: statusControl.value,
    };

    this.ticketService.editstatus(payload).subscribe({
      next: (response) => {
        if (response?.success) {
          this.snackBar.open(response.message || 'Ticket updated successfully.', '', {
            duration: 3000,
          });
          this.router.navigate(['/tickets']);
        } else {
          this.snackBar.open(response?.message || 'Failed to update ticket.', '', {
            duration: 3000,
          });
        }
      },
      error: (err) => {
        this.snackBar.open('Error occurred while updating ticket.', '', {
          duration: 3000,
        });
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
    this.snackBar.open('Popup blocked! Please allow popups for this site.', '', {
      duration: 3000,
    });
  }
}

  goBack(): void {
    this.router.navigate(['/tickets']);
  }
}
