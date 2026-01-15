import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { IncripcionesEventoResponse, InscripcionesResponse } from '../interface/inscripciones.interface';

@Injectable({
    providedIn: 'root'
})
export class InscripcionesService {

    private http=inject(HttpClient);
    private apiurl=environment.apiUrl;

    getInscripciones(){
        return this.http.get(`${this.apiurl}/Inscripciones`)
        .pipe(  
            tap(response => console.log(response)
        ));
    }

    getInscripcionById(id:number):Observable<InscripcionesResponse[]>{
        return this.http.get<InscripcionesResponse[]>(`${this.apiurl}/Inscripciones/${id}`)
        .pipe(  
            tap(response => console.log(response)
        ));
    }
    createInscripcion(inscripcion:InscripcionesResponse):Observable<InscripcionesResponse>{
        return this.http.post<InscripcionesResponse>(`${this.apiurl}/Inscripciones/create`,inscripcion)
        .pipe(  
            tap(response => console.log(response)
        ));
    }
    deleteInscripcionById(id:number):Observable<any>{
        return this.http.delete<any>(`${this.apiurl}/Inscripciones/${id}`)
        .pipe(  
            tap(response => console.log(response)
        ));
    }

    updateInscripcion(inscripcion:InscripcionesResponse):Observable<InscripcionesResponse>{
        return this.http.put<InscripcionesResponse>(`${this.apiurl}/Inscripciones/update/${inscripcion.idInscripcion}`,inscripcion)
        .pipe(  
            tap(response => console.log(response)
        ));
    }
      
    getIncripcionesUsuariosEVento(idEvento:number):Observable<IncripcionesEventoResponse[]>{
        return this.http.get<IncripcionesEventoResponse[]>(`${this.apiurl}/Inscripciones/InscripcionesEvento/${idEvento}`)
        .pipe(  
            tap(response => console.log(response)
        ));
    }

    getIncripcionesUsuarioQuiereSerCapitan(idEvento:number):Observable<IncripcionesEventoResponse[]>{
        return this.http.get<IncripcionesEventoResponse[]>(`${this.apiurl}/Inscripciones/InscripcionesUsuariosQuierenSerCapitan/${idEvento}`)
        .pipe(  
            tap(response => console.log(response)
        ));
    }

    getInscripcionesUsuarioEventoActividad(idEvento:number):Observable<IncripcionesEventoResponse[]>{
        return this.http.get<IncripcionesEventoResponse[]>(`${this.apiurl}/Inscripciones/InscripcionesUsuarioEventoActividad/${idEvento}`)
        .pipe(  
            tap(response => console.log(response)
        ));
    }

    getIncripcionesUsuariosEventoCapitanActividad(IdEvento:number):Observable<IncripcionesEventoResponse[]>{
        return this.http.get<IncripcionesEventoResponse[]>(`${this.apiurl}/Inscripciones/InscripcionesUsuariosEventoCapitanActividad/${IdEvento}`)
        .pipe(  
            tap(response => console.log(response)
        ));
    }
    InscripcionesUsuariosEventoCurso(idEvento:number,idCurso:number):Observable<IncripcionesEventoResponse[]>{
        return this.http.get<IncripcionesEventoResponse[]>(`${this.apiurl}/Inscripciones/InscripcionesUsuariosEventoCurso/${idEvento}/${idCurso}`)
        .pipe(  
            tap(response => console.log(response)
        ));
    }
    

    
}