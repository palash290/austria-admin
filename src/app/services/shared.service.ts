import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  //baseUrl = 'http://13.61.168.187:4000/admin/';
  baseUrl = 'http://192.168.29.44:4200/admin/';

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

  getApi(url: any): Observable<any> {
    const authToken = localStorage.getItem('austriaAdminToken')
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    })
    return this.http.get(this.baseUrl + url, { headers: headers })
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


  private refreshSidebarSource = new BehaviorSubject<void | null>(null);
  refreshSidebar$ = this.refreshSidebarSource.asObservable();

  triggerRefresh() {
    this.refreshSidebarSource.next(null);
  }


}
