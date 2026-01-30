import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const matchPassword = (matchTo: string): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent
    if (!parent) return null
    const matchValue = parent.get(matchTo)?.value
    return control.value === matchValue ? null : {passwordMismatch: true}
  }
}