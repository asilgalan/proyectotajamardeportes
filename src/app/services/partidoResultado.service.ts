import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { PartidoResultado } from '../interface/partidoResultado.interface';

@Injectable({
    providedIn: 'root'
})
export class PartidoResultadoService {

    private apiUrl=environment.apiUrl;
    private http=inject(HttpClient);

    getPartidoResultado():Observable<PartidoResultado[]>{

        return this.http.get<PartidoResultado[]>(`${this.apiUrl}/PartidoResultado`)
        .pipe(
            tap(response => console.log('PartidoResultado obtenidos:', response))
        );
    }

    getPartidoResultadoActividadEvento(idEventoActividad: number):Observable<PartidoResultado[]>{

        return this.http.get<PartidoResultado[]>(`${this.apiUrl}/PartidoResultado/PartidosResultadosActividad/${idEventoActividad}`)
        .pipe(
            tap(response => console.log('PartidoResultado por ActividadEvento obtenidos:', response))
        );
    }
    
    getPartidoResultadoPorEquipo(idEquipo: number):Observable<PartidoResultado[]>{

        return this.http.get<PartidoResultado[]>(`${this.apiUrl}/PartidoResultado/PartidosEquipo/${idEquipo}`)
        .pipe(
            tap(response => console.log('PartidoResultado por Equipo obtenidos:', response))
        );
    }
    getPartidoResultadoPorId(idPartidoResultado: number):Observable<PartidoResultado>{

        return this.http.get<PartidoResultado>(`${this.apiUrl}/PartidoResultado/${idPartidoResultado}`)
        .pipe(
            tap(response => console.log('PartidoResultado por ID obtenido:', response))
        );
    }

    deletePartidoResultado(idPartidoResultado: number):Observable<void>{

        return this.http.delete<void>(`${this.apiUrl}/PartidoResultado/${idPartidoResultado}`)
        .pipe(
            tap(() => console.log('PartidoResultado eliminado:', idPartidoResultado))
        );
    }

    createPartidoResultado(partidoResultado: PartidoResultado):Observable<PartidoResultado>{

        return this.http.post<PartidoResultado>(`${this.apiUrl}/PartidoResultado/create`, partidoResultado)
        .pipe(
            tap(response => console.log('PartidoResultado creado:', response))
        );
    }
    updatePartidoResultado(partidoResultado: PartidoResultado):Observable<PartidoResultado>{

        return this.http.put<PartidoResultado>(`${this.apiUrl}/PartidoResultado/update`, partidoResultado)
        .pipe(
            tap(response => console.log('PartidoResultado actualizado:', response))
        );
    }
}