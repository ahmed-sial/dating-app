import { Component, inject, OnInit, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute } from '@angular/router';
import { Photo } from '../../../types/photo';
import { ImageUpload } from "../../../shared/image-upload/image-upload";
import { ToastService } from '../../../core/services/toast-service';
import { Alert } from '../../../types/alert';
import { AccountService } from '../../../core/services/account-service';
import { LoginResponse } from '../../../types/loginResponse';
import { Member } from '../../../types/member';
import { StarButton } from "../../../shared/star-button/star-button";
import { DeleteButton } from "../../../shared/delete-button/delete-button";

@Component({
  selector: 'app-member-photos',
  imports: [ImageUpload, StarButton, DeleteButton],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css',
})
export class MemberPhotos implements OnInit {
  private _activatedRoute = inject(ActivatedRoute)
  private _toastService = inject(ToastService)
  private _accountService = inject(AccountService)
  protected memberPhotos = signal<Photo[]>([])
  protected memberService = inject(MemberService)
  protected loading = signal(false)
  protected currentUser = this._accountService.currentUser()

  ngOnInit(): void {
    const id = this._activatedRoute.parent?.snapshot.paramMap.get('id')
    if (!id) return
    this.memberService.getMemberPhotos(id).subscribe({
      next: photos => this.memberPhotos.set(photos),
      error: err => this._toastService.createToast(Alert.ERROR, 'An unexpected error occured!')
    })
  }

  onUploadImage(file: File) {
    this.loading.set(true)
    this.memberService.uploadPhoto(file).subscribe({
      next: photo => {
        this.memberService.editMode = false
        this.loading.set(false)
        this.memberPhotos.update(photos => [...photos, photo])
        if (!this.memberService.member()?.imageUrl)
          this.setMainLocalPhoto(photo)
      },
      error: _ => {
        this.loading.set(false)
        this._toastService.createToast(Alert.ERROR, 'Error occured while uploading image to cloud!')
      }
    })
  }

  setProfileImage(photo: Photo) {
    if (photo.url === this._accountService.currentUser()?.imageUrl) return;
    this.memberService.setProfileImage(photo).subscribe({
      next: _ => {
        this.setMainLocalPhoto(photo)
      },
      error: _ => this._toastService.createToast(Alert.ERROR, 'Error occured while setting profile photo!')
    })
  }

  deletePhoto(photoId: number) {
    this.memberService.deletePhoto(photoId).subscribe({
      next: _ => {
        this.memberPhotos.update(photos => photos.filter(x => x.id !== photoId))
      },
      error: _ => this._toastService.createToast(Alert.ERROR, "Error occured while deleting photo!")
    })
  }

  private setMainLocalPhoto(photo: Photo) {
    const currentUser = this._accountService.currentUser()
    if (currentUser) currentUser.imageUrl = photo.url
    this._accountService.setCurrentUser(currentUser as LoginResponse)
    this.memberService.member.update(member => ({
      ...member,
      imageUrl: photo.url
    }) as Member)


  }
}
