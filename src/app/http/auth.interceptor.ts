import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../api/auth-service';
import { environment } from '../../environment/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  console.log('url: ', req.url);
  console.log('hay token?', token ? 'SI' : 'NO');
  if (token) console.log('Token', token?.substring(0, 15) + '...');

  if (!token) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
