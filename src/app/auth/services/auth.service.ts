import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../interface/auth.interface';
import { Router } from '@angular/router';
import Perfil from '../../models/perfil';
import ServicePerfil from '../../services/perfil.service';
import ServiceOrganizadores from '../../services/organizadores.service';




@Injectable({providedIn: 'root'})
export class AuthService {
  
    private apiurl=environment.apiUrl;

    private http=inject(HttpClient);
    private isAuthenticated = false;
    private route=inject(Router);
    private perfilService=inject(ServicePerfil);
    private organizadorService=inject(ServiceOrganizadores);

 

  private _token= signal<string | null>(localStorage.getItem('token'));
  private _role=signal<number >(Number(localStorage.getItem('role')));
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
      isAdmin = computed(() => {
        return this._role() === 3;
      });

  
  

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

    async ensureUserProfile(): Promise<Perfil | null> {
        const existing = this._currentUser();
        if (existing) {
            console.log('Perfil existente:', existing);
            return existing;
        }
        const token = this._token();
        if (!token) {
            console.error('No hay token disponible');
            return null;
        }
        try {
            this._isLoading.set(true);
            const perfil = await this.perfilService.getPerfil();
            console.log('Perfil cargado desde API:', perfil);
            if (!perfil) {
                console.error('Perfil es null o undefined');
                return null;
            }
            this._currentUser.set(perfil);
            return perfil as Perfil;
        } catch (error) {
            console.error('Error al cargar el perfil:', error);
            return null;
        } finally {
            this._isLoading.set(false);
        }
    }

    login(userName: string, password: string):Observable<AuthResponse>{
       return this.http.post<AuthResponse>(`${this.apiurl}/Auth/LoginEventos`,{userName,password})
        .pipe(
            tap(response => {
                localStorage.setItem('token', response.response);
                localStorage.setItem('role', String(response.idrole));
            
                this._role.set(response.idrole);
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
        localStorage.removeItem('role');
        this._role.set(0);
        this._currentUser.set(null);
        this.isAuthenticated = false;
        this.organizadorService.resetOrganizadorState();
        this.route.navigate(['']);
    }
}