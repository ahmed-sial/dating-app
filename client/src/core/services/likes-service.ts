import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Member } from '../../types/member';

@Injectable({
  providedIn: 'root',
})
export class LikesService {
  private _baseUrl = environment.apiUrl
  private _http = inject(HttpClient)
  likeIds = signal<string[]>([])

  toggleLike(targetMemberId: string) {
    return this._http.post(`${this._baseUrl}/likes/${targetMemberId}`, {})
  }

  getLikes(predicate: string) {
    return this._http.get<Member[]>(`${this._baseUrl}/likes?predicate=${predicate}`)
  }

  getLikeIds() {
    return this._http.get<string[]>(`${this._baseUrl}/likes/list`).subscribe({
      next: ids => this.likeIds.set(ids) 
    })
  }

  clearLikeIds() {
    this.likeIds.set([])
  }
}
