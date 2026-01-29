import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import type { ActividadesResponse, ActividadEventoResponse } from '../interface/actividades.interface';
import { environment } from '../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class ActividadesService {

    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;


    getActividades():Observable<ActividadesResponse[]>{

        return this.http.get<ActividadesResponse[]>(this.apiUrl + '/Actividades').pipe(
            tap(response => console.log(response))
        );
    }
       getActividadesById(id:number):Observable<ActividadesResponse>{

        return this.http.get<ActividadesResponse>(`${this.apiUrl}/Actividades/${id}`).pipe(
            tap(response => console.log(response))
        );
    }
    createActividades(actividades:ActividadesResponse):Observable<ActividadesResponse>{
        return this.http.post<ActividadesResponse>(this.apiUrl + '/Actividades/create', actividades).pipe(
            tap(response => console.log(response))
        );
    }

        updateActividades(actividades:ActividadesResponse):Observable<ActividadesResponse>{
        return this.http.put<ActividadesResponse>(this.apiUrl + '/Actividades/update', actividades).pipe(
            tap(response => console.log(response))
        );
    }

    DeleteActividadesById(id:number):Observable<ActividadesResponse>{

        return this.http.delete<ActividadesResponse>(`${this.apiUrl}/Actividades/${id}`).pipe(
            tap(response => console.log(response))
        );
    }

   

    getActividadesByIdEnvento(id:number):Observable<ActividadEventoResponse[]>{
        return this.http.get<ActividadEventoResponse[]>(`${this.apiUrl}/Actividades/ActividadesEvento/${id}`).pipe(
            tap(response => console.log(response))
        );
    }

    


}