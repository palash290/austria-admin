import { Injectable } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

@Injectable({
      providedIn: 'root',
})
export class ErrorMessageService {
      constructor() { }

      getErrorMessage(control: AbstractControl | FormControl): string {
            if (control.hasError('required')) {
                  return 'This field cannot be empty';
            } else if (control.hasError('email')) {
                  return 'Please enter a valid email address';
            } else if (control.hasError('minlength')) {
                  return `Password must be at least ${control.getError('minlength').requiredLength} characters long`;
            } else if (control.hasError('validatePhoneNumber')) {
                  const errors = control.getError('validatePhoneNumber');
                  if (!errors.valid) return 'Please enter a valid phone number';
            } else if (control.hasError('strongPassword')) {
                  const errors = control.getError('strongPassword');
                  if (!errors.isValidLength)
                        return 'Password must be at least 8 characters long';
                  if (!errors.hasUpperCase)
                        return 'Password must contain at least one uppercase letter';
                  if (!errors.hasLowerCase)
                        return 'Password must contain at least one lowercase letter';
                  if (!errors.hasNumeric) return 'Password must contain at least one number';
                  if (!errors.hasSpecialCharacter)
                        return 'Password must contain at least one special character';
            }
            return '';
      }
}
