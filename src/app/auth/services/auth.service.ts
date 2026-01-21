import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../interface/auth.interface';
import { Router } from '@angular/router';
import Perfil from '../../models/perfil';
import ServicePerfil from '../../services/perfil.service';




@Injectable({providedIn: 'root'})
export class AuthService {
  
    private apiurl=environment.apiUrl;

    private http=inject(HttpClient);
    private isAuthenticated = false;
    private route=inject(Router);
    private perfilService=inject(ServicePerfil);

  private _token= signal<string | null>(localStorage.getItem('token'));
  private _currentUser = signal<Perfil | null>(null);
  private _isLoading = signal<boolean>(false);

    constructor(){

     window.addEventListener('storage', (event) => {
      if (event.key === 'token' && !event.newValue) {
        this.logout();
      }
    });
    
        const token=this._token();
        if(token){
            this.isAuthenticated=true;
            this._isLoading.set(true);
            this.loadUserProfile();
        }else{
            this.isAuthenticated=false;
        }
        
   
   
    }
    



      token = computed(() => this._token());
      currentUser = computed(() => this._currentUser());
      isLoading = computed(() => this._isLoading());

    private async loadUserProfile() {
        try {
            const perfil = await this.perfilService.getPerfil();
            this._currentUser.set(perfil);
        } catch (error) {
            console.error('Error al cargar el perfil:', error);
            this.logout();
        } finally {
            this._isLoading.set(false);
        }
    }

    login(userName: string, password: string):Observable<AuthResponse>{
       return this.http.post<AuthResponse>(`${this.apiurl}/Auth/LoginEventos`,{userName,password})
        .pipe(
            tap(response => {
                localStorage.setItem('token', response.response);
                this._token.set(response.response);
                this.isAuthenticated = true;
        
                this.loadUserProfile();
                console.log(response);
            })
        )

    }

    logout(){

        localStorage.removeItem('token');
        this._token.set(null);
        this._currentUser.set(null);
        this.isAuthenticated = false;
        this.route.navigate(['']);
    }
}