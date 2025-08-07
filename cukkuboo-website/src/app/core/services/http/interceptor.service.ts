import { Inject, Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SignInComponent } from '../../../pages/sign-in/sign-in.component';
@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {
  // public Storage: any[] = storage;
  constructor(
    private injector: Injector,
    private router: Router,
    private dialog: MatDialog
  ) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const excludedUrls = [
      '/login', '/logout', '/register', '/forgot-password'
    ];
    // Check if request URL matches excluded API endpoints
    if (excludedUrls.some(url => request.url.includes(url))) {
      return next.handle(request); // Skip interceptor
    }
    // this.showLoader();
    return next.handle(request).pipe(tap({
      next: (event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // this.hideLoader();
          if (event.body?.success === false) {
            if ((event.body?.message).includes("Invalid Token")) {
              this.router.navigate(['/signin']);
            }
          }
        }
      },
      error: (err: any) => {
        // this.hideLoader();
        this.handleAuthError(err, request, next)
      }
    })
      // , catchError((error) => this.handleAuthError(error, request, next))
    );
  }
  // private showLoader(): void {
  //   this.loaderService.show();
  // }
  // private hideLoader(): void {
  //   this.loaderService.hide();
  // }

  private handleAuthError(err: HttpErrorResponse, request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    //handle your auth error or rethrow
    if (err.status === 0 || err.status === 401 || err.status === 403) {
      console.clear()
      console.log(err.message)
      const url = location.href;
      if (!url.includes('signup') && !url.includes('signin'))
        this.openLoginModal();
      localStorage.clear();
      // this.storageService.updateItem("JWT", "ua");
      // if you've caught / handled the error, you don't want to rethrow it unless you also want downstream consumers to have to handle it as well.
      return of(err.message); // or EMPTY may be appropriate here
    }
    return throwError(() => err.status);
  }

  // openLoginModal(request: HttpRequest<any>, next: HttpHandler) {
  //   this.modalService.openDialog(LoginComponent, { isShowingInModal: true }, (res: any) => {
  //     if (!res?.status) {
  //       localStorage.clear();
  //       sessionStorage.clear();
  //       this.router.navigateByUrl(`login`);
  //     }
  //     else {
  //       // this.router.navigateByUrl(this.router.url);
  //       // window.location.reload();
  //       next.handle(request);
  //     }
  //   },)
  // }
  openLoginModal() {
    localStorage.clear();
    const dialogRef = this.dialog.open(SignInComponent, {
      data: 'unauth',
      width: 'auto', height: 'auto',
      panelClass: 'signin-modal'
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        // window.location.reload();
        window.location.reload();
      }
      else {
        this.router.navigate(['/signin']);
      }
      this.dialog.closeAll();
    });
  }

}


