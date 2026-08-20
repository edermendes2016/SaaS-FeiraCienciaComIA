import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class AuthValidators {
  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/ .test(value);
      const minLength = value.length >= 8;
      const maxLength = value.length <= 64;
      const notOnlySpaces = value.trim().length > 0;

      const passwordValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecial && minLength && maxLength && notOnlySpaces;

      return !passwordValid ? { passwordStrength: true } : null;
    };
  }

  static username(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const validChars = /^[a-zA-Z0-9_]*$/.test(value);
      const maxLength = value.length <= 30;

      return (!validChars || !maxLength) ? { usernameInvalid: true } : null;
    };
  }
}
