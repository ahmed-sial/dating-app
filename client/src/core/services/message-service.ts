import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginationResult } from '../../types/paginationResult';
import { Message } from '../../types/message';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private _baseUrl = environment.apiUrl
  private _http = inject(HttpClient)

  getMessage(container: string, pageNumber: number, pageSize: number) {
    let params = new HttpParams()
    params = params.append('pageNumber', pageNumber)
    params = params.append('pageSize', pageSize)
    params = params.append('container', container)
    return this._http.get<PaginationResult<Message>>(`${this._baseUrl}/messages`, { params })
  }

  getMessageThread(memberId: string) {
    return this._http.get<Message[]>(`${this._baseUrl}/messages/thread/${memberId}`)
  }

  sendMessage(recipientId: string, content: string) {
    return this._http.post<Message>(`${this._baseUrl}/messages`, { recipientId, content })
  }

  deleteMessage(id: string) {
    return this._http.delete(`${this._baseUrl}/messages/${id}`)
  }
}
