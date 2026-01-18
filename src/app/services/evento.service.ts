import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment.development";
import { Observable, tap } from "rxjs";
import { evento } from "../models/evento";

@Injectable({providedIn:'root'})
export class ServiceEventos {

    private urlEventos = environment.apiUrl;
    constructor(private _http: HttpClient){

    }

    getEventosCursoEscolar(): Observable<Array<evento>> {
    
        let request = "/Eventos/EventosCursoEscolar";

        return this._http.get<Array<evento>>(this.urlEventos + request);
    }

    createEvento(fecha: string): Observable<evento> {
   
        let request = "/Eventos/create/"+fecha;
        return this._http.post<evento>(this.urlEventos + request,{} ).pipe(
            tap(response => console.log('Evento creado:', response))    
        )};

        deleteEventoById(idEvento: number): Observable<evento> {
         
            let request = "/Eventos/"+idEvento;
            return this._http.delete<evento>(this.urlEventos + request).pipe(
                tap(response => console.log('Evento eliminado:', response))    
        )}

        getEventoPorId(idEvento: number): Observable<evento> {
    
        let request = "/Eventos/" + idEvento;

        return this._http.get<evento>(this.urlEventos + request);
    }
    }