import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { MiembroEquipos } from '../models/miembroEquipos';
import { MiembrosDelEquipo } from '../models/miembrosDelEquipo';

@Injectable({providedIn: 'root'})
export class MiembroEquiposService {

    private urlEventos = environment.apiUrl;
    constructor(private _http: HttpClient){

    }

    getMiembrosDelEquipo(idEquipo: number): Observable<Array<MiembrosDelEquipo>> {
        let request = "/Equipos/UsuariosEquipo/" + idEquipo;
        return this._http.get<Array<MiembrosDelEquipo>>(this.urlEventos + request);
    }

    getMiembroEquipos(): Observable<Array<MiembroEquipos>> {
        let request = "/MiembroEquipos";
        return this._http.get<Array<MiembroEquipos>>(this.urlEventos + request);
    }

    getMiembroEquipoById(id: number): Observable<MiembroEquipos> {
        let request = "/MiembroEquipos/" + id;
        return this._http.get<MiembroEquipos>(this.urlEventos + request);
    }

    deleteMiembroEquiposPorId(id: number): Observable<any> {
        let request = "/MiembroEquipos/" + id;
        return this._http.delete(this.urlEventos + request);
    }

    createMiembroEquipos(idUsuario: number, idEquipo: number): Observable<any> {
        let request = "/MiembroEquipos/create/" + idUsuario + "/" + idEquipo;
        return this._http.post(this.urlEventos + request, {});
    }

    updateMiembroEquipos(miembroEquipos: MiembroEquipos): Observable<any> {
        let miembroEquiposJson = JSON.stringify(miembroEquipos);
        let header = new HttpHeaders();
        header = header.set("Content-Type", "application/json");
        let request = "/MiembroEquipos/update";
        return this._http.put(this.urlEventos + request, miembroEquiposJson, {headers: header});
    }
}