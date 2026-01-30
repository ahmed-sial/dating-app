import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { matchPassword } from '../../../validators/passwordMatch';
import { TextInput } from "../../../shared/text-input/text-input";
import { AccountService } from '../../../core/services/account-service';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast-service';
import { Alert } from '../../../types/alert';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, TextInput],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  private _accountService = inject(AccountService)
  private _fb = inject(FormBuilder)
  private _router = inject(Router)
  private _toastService = inject(ToastService)
  protected registerForm!: FormGroup

  ngOnInit(): void {
    this.initForm() 
  }

  initForm() {
    this.registerForm = this._fb.group({
      displayName: [null, Validators.required],
      city: [null, Validators.required],
      country: [null, Validators.required],
      description: [],
      confirmPassword: [null, [matchPassword('password')]],
      dob: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      gender: [null, Validators.required],
      password: [null, [Validators.required, Validators.minLength(8)]],
    })
    this.registerForm.controls['password'].valueChanges.subscribe(() => {
      this.registerForm.controls['confirmPassword'].updateValueAndValidity()
    })
  }

  getMaxDate() {
    const currDate = new Date()
    currDate.setFullYear(currDate.getFullYear() - 18)
    return currDate.toISOString().split('T')[0]
  }

  register() {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value
      this._accountService.register(formData).subscribe({
        next: _ => {
          this._router.navigateByUrl('/members')
          this._toastService.createToast(Alert.SUCCESS, 'Logged in successfully!')
        },
        error: err => {
          console.error(err)
          this._toastService.createToast(Alert.ERROR, 'An unexpected error occured!')
        }

      })
    }
  }
}
