import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import PrecioActividad from "../models/precioActividad";

@Injectable({
  providedIn: 'root'
})
export default class ServicePrecioActividad
{
    constructor(private _http:HttpClient) {}

    //saca todos los precios 
    getPrecioActividad():Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/PrecioActividad";

        let promise = new Promise((resolve) =>
        {
            this._http.get(url+endPoint).subscribe(response =>
            {
                resolve(response);
            })
        })

        return promise;
    }

    //saca un precio por su id
    findPrecioActividad(idPrecioActividad:number):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/PrecioActividad/" + idPrecioActividad;

        let promise = new Promise((resolve) =>
        {
            this._http.get(url+endPoint).subscribe(response =>
            {
                resolve(response);
            })
        })

        return promise;
    }

    //borra un precio actividad
    deletePrecioActividad(idPrecioActividad:number):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/PrecioActividad/" + idPrecioActividad;

        let promise = new Promise((resolve) =>
        {
            this._http.delete(url+endPoint).subscribe(response =>
            {
                resolve(response);
            })
        })

        return promise;
    }

    //crea un precio actividad
    postPago(precioActividad:PrecioActividad):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/PrecioActividad/create";

        let data = JSON.stringify(precioActividad);
        let header = new HttpHeaders();
        header = header.set("Content-type", "application/json");

        let promise = new Promise((resolve) =>
        {
            this._http.post(url+endPoint, data, {headers: header}).subscribe(response =>
            {
                resolve(response);
            })
        })

        return promise;
    }

    //modifica un precio actividad
    putPago(precioActividad:PrecioActividad):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/PrecioActividad/update";

        let data = JSON.stringify(precioActividad);
        let header = new HttpHeaders();
        header = header.set("Content-type", "application/json");

        let promise = new Promise((resolve) =>
        {
            this._http.put(url+endPoint, data, {headers: header}).subscribe(response =>
            {
                resolve(response);
            })
        })

        return promise;
    }
}