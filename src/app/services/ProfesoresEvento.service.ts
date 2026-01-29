import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { ProfesorEvento } from '../interface/profesoreEvento.interface';

@Injectable({
    providedIn: 'root'
})
export class ProfesorEventoService {


    private http=inject(HttpClient);
    private apiUrl=environment.apiUrl;


    getProfesoresActivos():Observable<ProfesorEvento[]>{

        return this.http.get<ProfesorEvento[]>(`${this.apiUrl}/ProfesEventos/ProfesActivos`)
        .pipe(
          tap(response => console.log(response))
        );
    }

    getProfesoresEventoByIdProfesor(idProfesor:number):Observable<ProfesorEvento>{
        return this.http.get<ProfesorEvento>(`${this.apiUrl}/ProfesEventos/FindProfe?idprofesor=${idProfesor}`)
        .pipe(
          tap(response => console.log(response))
        );
    }

    getProfesoresConEvento():Observable<ProfesorEvento[]>{

        return this.http.get<ProfesorEvento[]>(`${this.apiUrl}/ProfesEventos/ProfesConEvento`)
        .pipe(
          tap(response => console.log(response))
        );
    }
    getProfesoresSinEvento():Observable<ProfesorEvento[]>{

        return this.http.get<ProfesorEvento[]>(`${this.apiUrl}/ProfesEventos/ProfesSinEvento`)
        .pipe(
          tap(response => console.log(response))
        );
    }
    createProfesorEvento(idevento:number,idprofesor:number):Observable<ProfesorEvento>{

        return this.http.post<ProfesorEvento>(`${this.apiUrl}/ProfesEventos/AsociarProfesorEvento/${idevento}/${idprofesor}`,{})
        .pipe(
          tap(response => console.log(response))
        );
    }

    deleteProfesorEventoById(idEvento:number):Observable<ProfesorEvento>{
        return this.http.delete<ProfesorEvento>(`${this.apiUrl}/ProfesEventos/EliminarProfesorEvento/${idEvento}`)
        .pipe(
          tap(response => console.log(response))
        );
    }
    }