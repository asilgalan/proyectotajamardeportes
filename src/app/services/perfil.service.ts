import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export default class ServicePerfil
{
    constructor(private _http:HttpClient) {}

    getPerfil(token:any):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/UsuariosDeportes/Perfil";

        let header = new HttpHeaders();

        
        let promise = new Promise((resolve) =>
        {
            this._http.get(url+endPoint).subscribe(response =>
            {
                resolve(response);
            })
        })

        return promise;
    }
}