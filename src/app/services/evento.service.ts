import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment.development";
import { Observable } from "rxjs";
import { evento } from "../models/evento";

@Injectable({providedIn:'root'})
export class ServiceEventos {
    constructor(private _http: HttpClient){

    }

    getEventosCursoEscolar(): Observable<Array<evento>> {
        var urlEventos = environment.apiUrl;
        let request = "/Eventos/EventosCursoEscolar";

        return this._http.get<Array<evento>>(urlEventos + request);
    }
}
