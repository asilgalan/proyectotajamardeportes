import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export default class ServiceGestion
{
    constructor(private _http:HttpClient) {}

    //saca los alumnos por curso
    getUsuariosPorCurso(idCurso:number):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/GestionEvento/UsuariosCurso/"+idCurso;

        let promise = new Promise((resolve, reject) =>{
            this._http.get(url+endPoint).subscribe({
                next: (response) => {
                    resolve(response);
                },
                error: (error) => {
                    reject(error);
                }
            })
        })

        return promise;
    }

    //saca los roles
    getRoles():Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/GestionEvento/Roles";

        let promise = new Promise((resolve, reject) =>{
            this._http.get(url+endPoint).subscribe({
                next: (response) => {
                    resolve(response);
                },
                error: (error) => {
                    reject(error);
                }
            })
        })

        return promise;
    }

    //saca los cursos activos
    getCursosActivos():Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/GestionEvento/CursosActivos";

        let promise = new Promise((resolve, reject) =>{
            this._http.get(url+endPoint).subscribe({
                next: (response) => {
                    resolve(response);
                },
                error: (error) => {
                    reject(error);
                }
            })
        })

        return promise;
    }
}