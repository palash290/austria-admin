import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  baseUrl = 'https://13.61.168.187:4000/admin/';
  //baseUrl = 'http://192.168.29.44:4200/admin/';

  constructor(private http: HttpClient, private route: Router) { }

  setToken(token: string) {
    localStorage.setItem('austriaAdminToken', token)
  }

  getToken() {
    return localStorage.getItem('austriaAdminToken')
  }

  isLogedIn() {
    return this.getToken() !== null
  }

  logout() {
    localStorage.removeItem('austriaAdminToken');
    this.route.navigateByUrl('');
  }

  loginUser(params: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    })
    return this.http.post<any>(this.baseUrl + 'sub-admin/login', params, {
      headers: headers
    })
  }

  // getApi(url: any): Observable<any> {
  //   const authToken = localStorage.getItem('austriaAdminToken')
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${authToken}`
  //   })
  //   return this.http.get(this.baseUrl + url, { headers: headers })
  // }

  getApi(url: string): Observable<any> {
    return this.http.get(this.baseUrl + url, { headers: this.getHeaders('application/json') }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  postAPI(url: any, data: any): Observable<any> {
    const authToken = localStorage.getItem('austriaAdminToken')
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${authToken}`
    })
    return this.http.post(this.baseUrl + url, data, { headers: headers })
  }

  postAPIUser<T, U>(url: string, data: U): Observable<T> {
    const authToken = localStorage.getItem('austriaAdminToken')
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${authToken}`
    })
    return this.http.post<T>(url, data, { headers: headers })
  };

  postData(url: any, data: any): Observable<any> {
    const authToken = localStorage.getItem('austriaAdminToken')
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    })
    return this.http.post(this.baseUrl + url, data, { headers: headers })
  }

  postAPIFormData(url: any, data: any): Observable<any> {
    const authToken = localStorage.getItem('austriaAdminToken')
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authToken}`
    })
    return this.http.post(this.baseUrl + url, data, { headers: headers })
  }

  deleteAcc(url: any): Observable<any> {
    const authToken = localStorage.getItem('austriaAdminToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    });
    return this.http.delete(this.baseUrl + url, { headers: headers })
  };

  //start//
  private getHeaders(contentType: string): HttpHeaders {
    const authToken = localStorage.getItem('austriaAdminToken') || '';
    return new HttpHeaders({
      'Content-Type': contentType,
      Authorization: `Bearer ${authToken}`
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) {
      this.handleUnauthorizedError();
    }
    return throwError(() => error);
  }

  private handleUnauthorizedError(): void {
    localStorage.removeItem('austriaAdminToken');
    this.route.navigate(['']);
  }
  //end//


  private refreshSidebarSource = new BehaviorSubject<void | null>(null);
  refreshSidebar$ = this.refreshSidebarSource.asObservable();

  triggerRefresh() {
    this.refreshSidebarSource.next(null);
  }


}
