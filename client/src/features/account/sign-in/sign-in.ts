import { Component, inject, viewChild } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { AccountService } from '../../../core/services/account-service';
import { FormsModule, NgForm } from '@angular/forms';
import { LoginDto } from '../../../types/loginDto';
import { ToastService } from '../../../core/services/toast-service';
import { Alert } from '../../../types/alert';

@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, FormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {
  private _accountService = inject(AccountService)
  private _toastService = inject(ToastService)
  private _router = inject(Router)
  protected signInForm = viewChild<NgForm>('signInForm');

  onFormSubmit() {
    const userEmail: string = this.signInForm()?.controls['userEmail'].value.trim();
    const userPassword: string = this.signInForm()?.controls['userPassword'].value.trim();
    const loginDto: LoginDto = { email: userEmail, password: userPassword };
    this._accountService.login(loginDto).subscribe({
      next: _ => {
        this._router.navigateByUrl('/members');
        this._toastService.createToast(Alert.SUCCESS, "Logged in successfully.");
      },
      error: (err) => {
        const errorMessage = err.error;
        this._toastService.createToast(Alert.ERROR, errorMessage)
      },
    })
  }
}
