import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable, tap } from 'rxjs';
import { Equipo } from '../models/equipo';
import { UsuariosEquipo } from '../models/usuariosEquipo';

@Injectable({providedIn: 'root'})
export class EquipoService {

    private urlEventos = environment.apiUrl;
    constructor(private _http: HttpClient){

    }

    getEquipos(): Observable<Array<Equipo>> {
        let request = "/Equipos";
        return this._http.get<Array<Equipo>>(this.urlEventos + request);
    }

    getEquiposJugadores(): Observable<Array<Equipo>> {
        let request = "/Equipos/EquipoJugadores";
        return this._http.get<Array<Equipo>>(this.urlEventos + request);
    }

    getEquipoPorId(id: number): Observable<Equipo> {
        let request = "/Equipos/" + id;
        return this._http.get<Equipo>(this.urlEventos + request);
    }

    deleteEquipoPorId(id: number): Observable<any> {
        let request = "/Equipos/" + id;
        return this._http.delete(this.urlEventos + request);
    }

    createEquipo(equipo: Equipo): Observable<any> {
        let equipoJson = JSON.stringify(equipo);
        let header = new HttpHeaders();
        header = header.set("Content-Type", "application/json");
        let request = "/Equipos/create";
        return this._http.post(this.urlEventos + request, equipoJson, {headers: header});
    }

    updateEquipo(equipo: Equipo): Observable<any> {
        let equipoJson = JSON.stringify(equipo);
        let header = new HttpHeaders();
        header = header.set("Content-Type", "application/json");
        let request = "/Equipos/update";
        return this._http.put(this.urlEventos + request, equipoJson, {headers: header});
    }
    
    updateEquipacionDelEquipo(idEquipo: number, idColor: number): Observable<any> {
        let request = "/Equipos/UpdateEquipacionEquipo/" + idEquipo + "/" + idColor;
        return this._http.put(this.urlEventos + request, {});
    }

    getEquiposPorActividadEvento(idActividad: number, idEvento: number): Observable<Array<Equipo>> {
        let request = "/Equipos/EquiposActividadEvento/"+ idActividad + "/" + idEvento;
        return this._http.get<Array<Equipo>>(this.urlEventos + request);
    }
    
    getEquiposPorEvento(idEvento: number): Observable<Array<Equipo>> {
        let request = "/Equipos/EquiposEvento/" + idEvento;
        return this._http.get<Array<Equipo>>(this.urlEventos + request);
    }
    
    getUsuariosPorEquipo(idEquipo: number): Observable<Array<UsuariosEquipo>> {
        let request ="/Equipos/UsuariosEquipo/" + idEquipo;
        return this._http.get<Array<UsuariosEquipo>>(this.urlEventos + request);
    }
    
    getEquiposPorCurso(idEvento: number, idCurso: number): Observable<Array<Equipo>> {
        let request ="/Equipos/EquiposCurso/" + idEvento + "?idcurso=" + idCurso;
        return this._http.get<Array<Equipo>>(this.urlEventos + request);
    }
}