import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export default class ServiceOrganizadores
{
    constructor(private _http:HttpClient) {}

    //saca los ids de todos los organizadores
    getIdsOrganizadores():Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Organizadores/IdsOrganizadoresEvento";

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

    //saca los usuarios de todos los organizadores
    getOrganizadores():Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Organizadores/OrganizadoresEvento";

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

    //busca un organizador por su id
    findOrganizador(idUsuario:number):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Organizadores/OrganizadorById/"+idUsuario;

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

    //crea un nuevo organizador con un id
    postOrganizador(idUsuario:number):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Organizadores/create/"+idUsuario;

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