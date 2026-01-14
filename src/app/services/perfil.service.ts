import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable()
export default class ServicePerfil
{
    constructor(private _http:HttpClient) {}

    getPerfil(token:any):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/UsuariosDeportes/Perfil";

        let header = new HttpHeaders();
        header = header.set("Authorization", `Bearer ${token}`);
        header = header.set("Content-Type", "application/json");
        
        let promise = new Promise((resolve) =>
        {
            this._http.get(url+endPoint, {headers:header}).subscribe(response =>
            {
                resolve(response);
            })
        })

        return promise;
    }
}