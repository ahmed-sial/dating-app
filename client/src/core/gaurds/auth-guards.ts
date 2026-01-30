import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account-service';

export const redirectToHomeIfNotLoggedInGuard: CanActivateFn = () => {
  const _accountService = inject(AccountService)
  const _router = inject(Router);
  if (!_accountService.isLoggedIn()) {
    _router.navigateByUrl('/')
    return false;
  }
  return true;
};

export const redirectToMembersIfLoggedInGaurd: CanActivateFn = () => {
  const _accountService = inject(AccountService);
  const _router = inject(Router)
  if (_accountService.isLoggedIn()) {
    _router.navigateByUrl('/members')
    return false;
  }
  return true;
}
