import { HttpEvent, HttpInterceptorFn } from '@angular/common/http'
import { of, tap } from 'rxjs'

const cache = new Map<string, HttpEvent<unknown>>();

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'GET') {
    const cahedResponse = cache.get(req.url)
    if (cahedResponse) {
      return of(cahedResponse)
    }
  }
  return next(req).pipe(
    tap(res => {
      cache.set(req.url, res)
    })
  )
}
