import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable, tap } from 'rxjs';
import { EquipoResponse } from '../interface/equipo.interface';

@Injectable({
    providedIn: 'root'
})
export class EquipoService {

    private http=inject(HttpClient);
    private apiurl=environment.apiUrl

    getEquipos():Observable<EquipoResponse[]>{

        return this.http.get<EquipoResponse[]>(`${this.apiurl}/Equipos`)
        .pipe(

            tap(response => console.log(response)
            
        ))
    }

    getEquipoPorId(id:number):Observable<EquipoResponse>{

        return this.http.get<EquipoResponse>(`${this.apiurl}/Equipos/${id}`)
        .pipe(  
            tap(response => console.log(response)
        ))
    }

    deleteEquipoById(id:number):Observable<any>{

        return this.http.delete<any>(`${this.apiurl}/Equipos/${id}`)
        .pipe(  
            tap(response => console.log(response)
        ))
    }

    createEquipo(equipo:EquipoResponse):Observable<EquipoResponse>{
        return this.http.post<EquipoResponse>(`${this.apiurl}/Equipos/create`,equipo)
        .pipe(  
            tap(response => console.log(response)
        ))


    }
    updateEquipo(equipo:EquipoResponse):Observable<EquipoResponse>{
        return this.http.put<EquipoResponse>(`${this.apiurl}/Equipos/update/${equipo.idEquipo}`,equipo)
        .pipe(  
            tap(response => console.log(response)
        ))
    }

    updateEquipacionDelEquipo(idEquipo:number, idColor:number):Observable<EquipoResponse>{
        return this.http.put<EquipoResponse>(`${this.apiurl}/Equipos/UpdateEquipacionEquipo/${idEquipo}/${idColor}`,{})
        .pipe(  
            tap(response => console.log(response)
        ))
    }
    getEquiposPorActividadEvento(idEventoActividad:number,idEvento:number):Observable<EquipoResponse[]>{
        return this.http.get<EquipoResponse[]>(`${this.apiurl}/Equipos/EquiposActividadEvento/${idEventoActividad}/${idEvento}`)
        .pipe(  
            tap(response => console.log(response)
        ))
    }
    getEquiposPorEvento(idEvento:number):Observable<EquipoResponse[]>{
        return this.http.get<EquipoResponse[]>(`${this.apiurl}/Equipos/EquiposEvento/${idEvento}`)
        .pipe(  
            tap(response => console.log(response)
        ))
    }
    
    getUsuariosPorEquipo(idEquipo:number):Observable<EquipoResponse[]>{
        return this.http.get<EquipoResponse[]>(`${this.apiurl}/Equipos/UsuariosEquipo/${idEquipo}`)
        .pipe(  
            tap(response => console.log(response)
        ))
    }

    getEquiposPorCurso(idCurso:number):Observable<EquipoResponse[]>{
        return this.http.get<EquipoResponse[]>(`${this.apiurl}/Equipos/EquiposCurso/${idCurso}`)
        .pipe(  
            tap(response => console.log(response)
        ))
    }

}