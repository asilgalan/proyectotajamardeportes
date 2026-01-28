import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import Pago from "../models/pago";

@Injectable({
  providedIn: 'root'
})
export default class ServicePagos
{
    constructor(private _http:HttpClient) {}

    //saca todos los pagos
    getPagos():Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Pagos";

        let promise = new Promise((resolve) =>
        {
            this._http.get(url+endPoint).subscribe(response =>
            {
                resolve(response);
            })
        })

        return promise;
    }

    //saca los pagos por curso
    getPagosPorCurso(idCurso:number):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Pagos/PagosCurso/" + idCurso;

        let promise = new Promise((resolve) =>
        {
            this._http.get(url+endPoint).subscribe(response =>
            {
                resolve(response);
            })
        })

        return promise;
    }

    //saca los pagos completos por curso
    getPagosCompletosPorCurso(idCurso:number):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Pagos/PagosCompletoCurso/" + idCurso;

        let promise = new Promise((resolve) =>
        {
            this._http.get(url+endPoint).subscribe(response =>
            {
                resolve(response);
            })
        })

        return promise;
    }

    //saca los pagos por evento
    getPagosEvento(idEvento:number):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Pagos/PagosEvento/" + idEvento;

        let promise = new Promise((resolve) =>
        {
            this._http.get(url+endPoint).subscribe(response =>
            {
                resolve(response);
            })
        })

        return promise;
    }

    //borra un pago
    deletePago(idPago:number):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Pagos/" + idPago;

        let promise = new Promise((resolve) =>
        {
            this._http.delete(url+endPoint).subscribe(response =>
            {
                resolve(response);
            })
        })

        return promise;
    }

    //crea un pago desde cero
    postPago(pago:Pago):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Pagos/create";

        let data = JSON.stringify(pago);
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

    //crea un pago ya pagado
    postPagoPagado(idEventoActividad:number, idCurso:number, cantidad:number):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Pagos/PagoEventoActividad/"+idEventoActividad+"/"+idCurso+"/"+cantidad;

        let promise = new Promise((resolve) =>
        {
            this._http.post(url+endPoint,{}).subscribe(response =>
            {
                resolve(response);
            })
        })

        return promise;
    }

    //modifica un pago
    putPago(pago:Pago):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Pagos/update";

        let data = JSON.stringify(pago);
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