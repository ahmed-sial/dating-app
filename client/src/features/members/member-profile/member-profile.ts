import { Component, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { Member } from '../../../types/member'
import { DatePipe, TitleCasePipe } from '@angular/common'
import { EditableMember } from '../../../types/editableMember'
import { FormsModule, NgForm } from '@angular/forms'
import { ToastService } from '../../../core/services/toast-service'
import { Alert } from '../../../types/alert'
import { MemberService } from '../../../core/services/member-service'
import { TimeAgoPipe } from '../../../pipes/time-ago-pipe'

@Component({
  selector: 'app-member-profile',
  imports: [TitleCasePipe, DatePipe, FormsModule, TimeAgoPipe],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css',
})
export class MemberProfile implements OnInit, OnDestroy {
  @ViewChild('editForm') editForm?: NgForm
  @HostListener('window:beforeunload', ['$event']) notify($event: BeforeUnloadEvent) {
    if (this.editForm?.dirty) {
      $event.preventDefault()
    }
  }
  private _toastService = inject(ToastService)
  private _memberService = inject(MemberService)
  protected editableMember!: EditableMember
  protected isInEditMode = this._memberService.editMode
  protected member = this._memberService.member

  ngOnInit(): void {
    this.editableMember = {
      displayName: this.member()?.displayName || '',
      description: this.member()?.description || '',
      city: this.member()?.city || '',
      country: this.member()?.country || ''
    }
  }

  updateProfile() {
    if (!this.member) return
    const updatedMember = { ...this.member(), ...this.editableMember }
    this._memberService.updateMember(updatedMember).subscribe({
      next: () => {
        this._toastService.createToast(Alert.SUCCESS, "Profile updated!")
        this._memberService.editMode = false
        this._memberService.member = updatedMember as Member
        this.editForm?.reset(updatedMember)
      },
      error: err => {
        this._toastService.createToast(Alert.ERROR, "An unexpected error occured!")
      }
    })

  }
  ngOnDestroy(): void {
    if (this._memberService.editMode()) {
      this._memberService.editMode = false
    }
  }
}
