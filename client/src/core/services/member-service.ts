import { inject, Injectable, signal, WritableSignal } from '@angular/core'
import { environment } from '../../environments/environment.development'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Member } from '../../types/member'
import { Photo } from '../../types/photo'
import { EditableMember } from '../../types/editableMember'
import { tap } from 'rxjs'
import { PaginationResult } from '../../types/paginationResult'
import { MemberParams } from '../../types/memberParams'

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private _baseUrl = environment.apiUrl
  private _http = inject(HttpClient)
  private _editMode = signal(false)
  private _member = signal<Member | null>(null)

  getMembers(memberParams: MemberParams) {
    let params = new HttpParams()
    params = params.append('pageNumber', memberParams.pageNumber.toString())
    params = params.append('pageSize', memberParams.pageSize.toString())
    params = params.append('minAge', memberParams.minAge.toString())
    params = params.append('maxAge', memberParams.maxAge.toString())
    if (memberParams.gender) params = params.append('gender', memberParams.gender)

    return this._http.get<PaginationResult<Member>>(`${this._baseUrl}/members`, { params })
  }

  getMemberById(id: string) {
    return this._http.get<Member>(`${this._baseUrl}/members/${id}`).pipe(
      tap(member => {
        this._member.set(member)
      })
    )
  }

  getMemberPhotos(id: string) {
    return this._http.get<Photo[]>(`${this._baseUrl}/members/${id}/photos`)
  }

  updateMember(editableMember: EditableMember) {
    return this._http.put(`${this._baseUrl}/members`, editableMember)
  }

  uploadPhoto(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return this._http.post<Photo>(`${this._baseUrl}/members/upload-photo`, formData)
  }

  setProfileImage(photo: Photo) {
    return this._http.put(`${this._baseUrl}/members/set-profile-image/${photo.id}`, {})
  }

  deletePhoto(photoId: number) {
    return this._http.delete(`${this._baseUrl}/members/remove-photo/${photoId}`)
  }

  get editMode(): WritableSignal<boolean> {
    return this._editMode
  }

  set editMode(value: boolean) {
    this._editMode.set(value)
  }

  get member(): WritableSignal<Member | null> {
    return this._member
  }

  set member(value: Member) {
    this._member.set(value)
  }


}
