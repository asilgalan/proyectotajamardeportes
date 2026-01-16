import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable, tap } from 'rxjs';
import { UsuarioDeporteResponse } from '../interface/usuariodeporte.interface';

@Injectable({
    providedIn: 'root'
})
export class UsuarioDeporteService {


    private http=inject(HttpClient);
    private apiUrl=environment.apiUrl;

    getActividadesDeUsuario():Observable<UsuarioDeporteResponse[]>{

        return this.http.get<UsuarioDeporteResponse[]>(`${this.apiUrl}/UsuariosDeportes/ActividadesUser`)
        .pipe(
            tap(response => console.log('Actividades de usuario obtenidas:', response))
        );
    }
}