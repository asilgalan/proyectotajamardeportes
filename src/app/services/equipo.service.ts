import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class EquipoService {

    private http=inject(HttpClient);
    private apiurl=environment.apiUrl



}