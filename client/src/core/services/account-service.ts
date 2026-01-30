import { HttpClient } from '@angular/common/http'
import { computed, inject, Injectable, signal } from '@angular/core'
import { LoginDto } from '../../types/loginDto'
import { LoginResponse } from '../../types/loginResponse'
import { map, Observable, tap } from 'rxjs'
import { environment } from '../../environments/environment.development'
import { RegisterDto } from '../../types/registerDto'
import { LikesService } from './likes-service'

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private _baseUrl = environment.apiUrl 
  private _likeService = inject(LikesService)
  private _http = inject(HttpClient)
  private _currentUser = signal<LoginResponse | null>(this.getUserFromStorage())

  currentUser = this._currentUser.asReadonly()
  isLoggedIn = computed(() => !!this._currentUser())

  login(loginDto: LoginDto): Observable<LoginResponse> {
    if (!loginDto) throw new Error("LoginDto is required!")

    return this._http
      .post<LoginResponse>(`${this._baseUrl}/account/login`, loginDto)
      .pipe(
        tap(user => {
          this.setCurrentUser(user)
        })
      )
  }
  setCurrentUser(user: LoginResponse) {
    localStorage.setItem('currentUser', JSON.stringify(user))
    this._currentUser.set(user)
    this._likeService.getLikeIds()
  }
  private getUserFromStorage(): LoginResponse | null {
    const user = localStorage.getItem('currentUser')
    return user ? JSON.parse(user) : null
  }

  logout() {
    localStorage.removeItem('currentUser')
    this._likeService.clearLikeIds()
    this._currentUser.set(null)
  }

  register(user: RegisterDto) {
    return this._http.post<LoginResponse>(`${this._baseUrl}/account/register`, user).pipe(
      tap(user => {
        if (user)
          this.setCurrentUser(user)
      })
    )
  }

}
