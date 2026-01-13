import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable, tap } from 'rxjs';
import { ColoreResponse } from '../interface/colores.interface';

@Injectable({
    providedIn: 'root'
})
export class ColorService {

    private http=inject(HttpClient)
    private apiUrl=environment.apiUrl;


    getColores():Observable<ColoreResponse[]>{

        return this.http.get<ColoreResponse[]>(this.apiUrl+"/Colores")
        .pipe(
            tap(resp => console.log(resp)
            )
        )
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


        DeleteColoresById(idColor :number):Observable<ColoreResponse>{

        return this.http.delete<ColoreResponse>(`${this.apiUrl}/Colores/${idColor}`)
        .pipe(
            tap(resp => console.log(resp)
            )
        )
    }
}
