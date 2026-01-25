import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable, tap } from 'rxjs';
import { ColoreResponse } from '../interface/colores.interface';
import { Color } from '../models/color';

@Injectable({
    providedIn: 'root'
})
export class ColorService {

    private http=inject(HttpClient)
    private apiUrl=environment.apiUrl;
    constructor(private _http: HttpClient){

    }


    getColores():Observable<ColoreResponse[]>{

        return this.http.get<ColoreResponse[]>(this.apiUrl+"/Colores")
        .pipe(
            tap(resp => console.log(resp)
            )
        )
    }

    getColores2(): Observable<Array<Color>> {
        let request = "/Colores";
        return this._http.get<Array<Color>>(this.apiUrl + request);
    }

        getColoresById(idColor :number):Observable<ColoreResponse>{

        return this.http.get<ColoreResponse>(`${this.apiUrl}/Colores/${idColor}`)
        .pipe(
            tap(resp => console.log(resp)
            )
        )
    }

         EditColoresById(color:ColoreResponse):Observable<ColoreResponse>{

           return this.http.put<ColoreResponse>(`${this.apiUrl}/Colores/update/`,color)
           .pipe(
            tap(resp => console.log(resp)
            )
        )
    }


    
         CreateColores(color:string):Observable<ColoreResponse>{

           return this.http.post<ColoreResponse>(`${this.apiUrl}/Colores/create/${color}`,color)
           .pipe(
            tap(resp => console.log(resp)
            )
        )
    }

    CrearColor(color: string): Observable<any> {
        let request = "/Colores/create/" + color;
        return this._http.post(this.apiUrl + request, {});
    }


        DeleteColoresById(idColor :number):Observable<ColoreResponse>{

        return this.http.delete<ColoreResponse>(`${this.apiUrl}/Colores/${idColor}`)
        .pipe(
            tap(resp => console.log(resp)
            )
        )
    }

    deleteColor(idColor: number): Observable<any> {
        let request = "/Colores/" + idColor;

        return this._http.delete(this.apiUrl + request);
    }
}
