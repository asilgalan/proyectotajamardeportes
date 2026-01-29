import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ActividadEvento, ActividadEventoCreate } from '../interface/actividadEvento.interface';

@Injectable({
    providedIn: 'root'
})
export class ActividadEventoService {

    private apiUrl=environment.apiUrl;
    private http=inject(HttpClient)


    getActividadesEvento():Observable<ActividadEvento[]>{

        return this.http.get<ActividadEvento[]>(`${this.apiUrl}/ActividadesEvento`)
        .pipe(
            tap(response => console.log('ActividadesEvento :', response))
        );
    }

    getActividadEventoById(id:number):Observable<ActividadEvento>{

        return this.http.get<ActividadEvento>(`${this.apiUrl}/ActividadesEvento/${id}`)
        .pipe(
            tap(response => console.log(`ActividadEvento ${id}:`, response))
        );
    }
    deleteActividadEvento(id:number):Observable<any>{

        return this.http.delete<any>(`${this.apiUrl}/ActividadesEvento/${id}`)
        .pipe(
            tap(response => console.log(`ActividadEvento ${id} eliminada:`, response))
        );
    }
    createActividadEvento(actividadEvento: ActividadEventoCreate):Observable<ActividadEvento>{
        return this.http.post<ActividadEvento>(`${this.apiUrl}/ActividadesEvento/create/${actividadEvento.idEvento}/${actividadEvento.idActividad}`, {})
        .pipe(
            tap(response => console.log('ActividadEvento creada :', response))
        );
    }

    updateActividadEvento( actividadEvento:ActividadEvento):Observable<ActividadEvento>{

        return this.http.put<ActividadEvento>(`${this.apiUrl}/ActividadesEvento/update/`, actividadEvento)
        .pipe(
            tap(response => console.log(`ActividadEvento actualizada:`, response))
        );
    }
     deleteActividadDelPanico(idEventoActividad:number):Observable<void>{
    
            return this.http.delete<void>(`${this.apiUrl}/ActividadesEvento/DeleteEventoActividadPanic/${idEventoActividad}`)
        }

    getActividadesEventoByEventoidByActividadid(eventoId:number, actividadId:number):Observable<any>{

        return this.http.get<any>(`${this.apiUrl}/ActividadesEvento/FindIdEventoActividad/${eventoId}/${actividadId}`)
        .pipe(
            tap(response => console.log(`ActividadEvento con eventoId ${eventoId} y actividadId ${actividadId}:`, response))
        );
    }
}