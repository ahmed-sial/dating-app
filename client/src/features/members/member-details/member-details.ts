import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute, Router, RouterLink, RouterOutlet, RouterLinkActive, NavigationEnd } from '@angular/router'
import { filter } from 'rxjs'
import { KeyValuePipe, Location } from '@angular/common'
import { AgePipe } from '../../../pipes/age-pipe'
import { AccountService } from '../../../core/services/account-service'
import { ToastService } from '../../../core/services/toast-service'
import { Alert } from '../../../types/alert'
import { MemberService } from '../../../core/services/member-service'

@Component({
  selector: 'app-member-details',
  imports: [AgePipe, KeyValuePipe, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './member-details.html',
  styleUrl: './member-details.css',
})
export class MemberDetails implements OnInit {
  private _activatedRoute = inject(ActivatedRoute)
  private _router = inject(Router)
  private _location = inject(Location)
  private _accountService = inject(AccountService)
  private _toastService = inject(ToastService)
  private _memberService = inject(MemberService)
  protected member = this._memberService.member
  protected title = signal<string | undefined>('Profile')
  protected routeId = signal<string | null>(null)
  protected editMode = this._memberService.editMode
 
  protected isCurrentUser = computed(() => {
    return (this.routeId() === this._accountService.currentUser()?.id)
  })

  protected tabs = {
    "Profile": "profile",
    "Photos": "photos",
    "Messages": "messages",
  }

  ngOnInit(): void {
    this._activatedRoute.paramMap.subscribe({
      next: params => this.routeId.set(params.get('id')),
      error: _ => this._toastService.createToast(Alert.ERROR, "Couldn't read the query params.")
    })

    this.title.set(this._activatedRoute.firstChild?.snapshot.title)
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe({
      next: () => {
        this.title.set(this._activatedRoute.firstChild?.snapshot.title)
      }
    })
  }

  onGoBackClick() {
    this._location.back()
  }

  onEditClick() {
    this._memberService.editMode = !this._memberService.editMode()
  }
}
