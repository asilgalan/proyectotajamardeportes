import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../interface/auth.interface';




@Injectable({providedIn: 'root'})
export class AuthService {
  
    private apiurl=environment.apiUrl;

    private http=inject(HttpClient);
    private isAuthenticated = false;

  private _token= signal<string | null>(localStorage.getItem('token'));

    constructor(){
        const token=this._token();
        if(!token){
            this.isAuthenticated=false;
        }else{
            this.isAuthenticated=true;
        }
    }



      token = computed(() => this._token());

    login(userName: string, password: string):Observable<AuthResponse>{

       return this.http.post<AuthResponse>(`${this.apiurl}/Auth/LoginEventos`,{userName,password})
        .pipe(
            tap(response => {
                localStorage.setItem('token', response.response);
                this._token.set(response.response);
                this.isAuthenticated = true;
                console.log(response);
            })
        )

    }

    logout(){
        localStorage.removeItem('token');
        this._token.set(null);
        this.isAuthenticated = false;
    }
}