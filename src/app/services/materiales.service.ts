import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import Material from "../models/material";

@Injectable({
  providedIn: 'root'
})
export default class ServiceMateriales
{
    constructor(private _http:HttpClient) {}

    //saca todos los materiales
    getMateriales():Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Materiales";

        let promise = new Promise((resolve) =>
        {
            this._http.get(url+endPoint).subscribe(response =>
            {
                resolve(response);
            })
        })

        return promise;
    }

    //saca los materiales por actividad
    getMaterialesActividad(idActividad:number):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Materiales/MaterialesActividad/"+idActividad;

        let promise = new Promise((resolve) =>
        {
            this._http.get(url+endPoint).subscribe(response =>
            {
                resolve(response);
            })
        })

        return promise;
    }

    //saca un material por su id
    findMaterial(idMaterial:number):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Materiales/"+idMaterial;

        let promise = new Promise((resolve) =>
        {
            this._http.get(url+endPoint).subscribe(response =>
            {
                resolve(response);
            })
        })

        return promise;
    }

    //borra un material
    deleteMaterial(idMaterial:number):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Materiales/" + idMaterial;

        let promise = new Promise((resolve) =>
        {
            this._http.delete(url+endPoint).subscribe(response =>
            {
                resolve(response);
            })
        })

        return promise;
    }

    //crea un material
    postMaterial(material:Material):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Materiales/create";

        let data = JSON.stringify(material);
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

    //modifica un material
    putMaterial(material:Material):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Materiales/update";

        let data = JSON.stringify(material);
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