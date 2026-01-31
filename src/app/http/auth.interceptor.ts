import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../api/auth-service';
import { environment } from '../../environment/environment.prod'; 

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  if (!token) return next(req);

  // opcional solo a la API
if (!req.url.startsWith(environment.apiUrl)) return next(req);


  return next(req.clone({
    setHeaders: { Authorization: `Basic ${token}` },
  }));
};
