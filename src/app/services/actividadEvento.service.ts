import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ActividadEventoService {

    private apiUrl=environment.apiUrl;
    private http=inject(HttpClient)


    getActividadesEvento():Observable<any>{

        return this.http.get<any>(`${this.apiUrl}/ActividadesEvento`)
        .pipe(
            tap(response => console.log('ActividadesEvento :', response))
        );
    }

    getActividadEventoById(id:number):Observable<any>{

        return this.http.get<any>(`${this.apiUrl}/ActividadesEvento/${id}`)
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
    createActividadEvento(actividadEvento:any):Observable<any>{

        return this.http.post<any>(`${this.apiUrl}/ActividadesEvento/create`, actividadEvento)
        .pipe(
            tap(response => console.log('ActividadEvento creada :', response))
        );
    }

    updateActividadEvento(id:number, actividadEvento:any):Observable<any>{

        return this.http.put<any>(`${this.apiUrl}/ActividadesEvento/update/${id}`, actividadEvento)
        .pipe(
            tap(response => console.log(`ActividadEvento ${id} actualizada:`, response))
        );
    }

    getActividadesEventoByEventoidByActividadid(eventoId:number, actividadId:number):Observable<any>{

        return this.http.get<any>(`${this.apiUrl}/ActividadesEvento/FindIdEventoActividad/${eventoId}/${actividadId}`)
        .pipe(
            tap(response => console.log(`ActividadEvento con eventoId ${eventoId} y actividadId ${actividadId}:`, response))
        );
    }
}