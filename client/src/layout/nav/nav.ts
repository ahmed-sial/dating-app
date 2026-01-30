import { KeyValuePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, input, OnInit, signal, } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AccountService } from '../../core/services/account-service';
import { MemberService } from '../../core/services/member-service';

@Component({
  selector: 'app-nav',
  imports: [KeyValuePipe, RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav implements OnInit {
  private _router = inject(Router)
  protected _accountService = inject(AccountService);
  protected navLinks = {
    'Matches' : '/members',
    'Lists' : '/lists',
    'Messages' : '/messages',
  };
  appTitle = input.required();
  protected currentUser = this._accountService.currentUser;
  protected themes: 'dark' | 'light' = 'dark';
  protected theme = signal<string>(localStorage.getItem('theme') || 'dark');

  ngOnInit(): void {
    document.documentElement.setAttribute('data-theme', this.theme());
  }

  onThemeSelect(theme: string) {
    this.theme.set(theme);
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
  onLogoutClick() {
    this._accountService.logout();
    this._router.navigateByUrl('/')
  }

}
