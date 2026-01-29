import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export default class ServicePerfil
{
    constructor(private _http:HttpClient) {}

    getPerfil():Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/UsuariosDeportes/Perfil";

        let promise = new Promise((resolve, reject) =>{
            this._http.get(url+endPoint).subscribe({
                next: (response) => {
                    const perfilNormalizado = this.normalizarPerfil(response);
                    resolve(perfilNormalizado);
                },
                error: (error) => {
                    reject(error);
                }
            })
        })

        return promise;
    }

    private normalizarPerfil(response: any): any {
        if (Array.isArray(response)) {
            return response[0] ?? null;
        }
        if (response?.usuario) {
            return response.usuario;
        }
        return response;
    }

    getEventosYActividades():Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/UsuariosDeportes/ActividadesUser";

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