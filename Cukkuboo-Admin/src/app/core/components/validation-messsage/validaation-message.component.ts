import { Component, Input } from '@angular/core';
import { ValidationService } from '../../services/validation.service';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'Validation-Messages',
    template: '<ng-container *ngIf="errorMessage !== null"> {{errorMessage}} </ng-container>',
    imports: [CommonModule]
})
export class ValidationMessagesComponent {
    @Input()
    control!: any;

    constructor() {

    }

    get errorMessage() {

        for (let propertyName in this.control.errors) {
            if (this.control.errors.hasOwnProperty(propertyName) && this.control.touched) {
                return ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
            }
        }
        return null;
    }
}