import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, pipe, tap } from 'rxjs';
import { CapitanActividad } from '../interface/capitanActividad.interface';

@Injectable({
    providedIn: 'root'
})
export class CapitanActividadService {


    private http=inject(HttpClient);

    private apiUrl=environment.apiUrl;

    getCapitanActividad():Observable<CapitanActividad[]>{
        return this.http.get<CapitanActividad[]>(`${this.apiUrl}/CapitanActividades`)
        .pipe(
            tap(response => console.log('CapitanActividad obtenidas:', response))
        );
    }

    getCapitanActividadByIdUsuarioCapitan(id:number):Observable<any>{
        return this.http.get<any>(`${this.apiUrl}/CapitanActividades/FindCapitanUsuario/${id}`)
        .pipe(
            tap(response => console.log('CapitanActividad por Usuario Capitan obtenidas:', response))
        );  
    }

       getCapitanActividadByIdEventoActividad(id:number):Observable<any>{
        return this.http.get<any>(`${this.apiUrl}/CapitanActividades/FindCapitanEventoActividad/${id}`)
        .pipe(
            tap(response => console.log('CapitanActividad por Evento Actividad obtenidas:', response))
        );

    }

    getCapitanActividadById(id:number):Observable<CapitanActividad>{
        return this.http.get<CapitanActividad>(`${this.apiUrl}/CapitanActividades/${id}`);
    }

    deleteCapitanActividad(id:number):Observable<void>{
        return this.http.delete<void>(`${this.apiUrl}/CapitanActividades/${id}`);
    }

    createCapitanActividad(capitanActividad: CapitanActividad):Observable<CapitanActividad>{
        return this.http.post<CapitanActividad>(`${this.apiUrl}/CapitanActividades/create`, capitanActividad);
    }

    updateCapitanActividad(capitanActividad:CapitanActividad):Observable<CapitanActividad>{
        return this.http.put<CapitanActividad>(`${this.apiUrl}/CapitanActividades/update`, capitanActividad);
    }


}