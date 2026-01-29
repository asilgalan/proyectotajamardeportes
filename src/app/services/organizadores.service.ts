import { computed, Injectable, signal } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { catchError, map, Observable, of, tap } from "rxjs";
import { M } from "@angular/cdk/keycodes";

@Injectable({
  providedIn: 'root'
})
export default class ServiceOrganizadores
{
    constructor(private _http:HttpClient) {}
    public _isOrganizador=signal<boolean>(false);
    esOrganizador=computed(()=>this._isOrganizador());

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
    findOrganizador(idUsuario:number):Observable<any>
    {
       
        return this._http.get<any>(`${environment.apiUrl}/Organizadores/OrganizadorById/${idUsuario}`)
        .pipe(tap(response => console.log('Organizador obtenido:', response)));

      
    }

    isOrganizador(idUsuario:number):Observable<boolean>{
        return this.findOrganizador(idUsuario).pipe(
            tap(response => console.log('Verificando si es organizador:', response)),
           map(OrganizadorUsuario =>{

            if(OrganizadorUsuario){
    
                this._isOrganizador.set(true);
                console.log("Organizador confirmado para usuario ID: " + OrganizadorUsuario.idCursosUsuarios);
                
            }else{
                this._isOrganizador.set(false);
            }
                return OrganizadorUsuario && OrganizadorUsuario.idCursosUsuarios === idUsuario;
           }), 
           catchError((error) => {
            console.log(error.message);
            this._isOrganizador.set(false);
            return of(false);
          })
     
        )
    }

    resetOrganizadorState(): void {
        this._isOrganizador.set(false);
        console.log('Estado de organizador reseteado');
    }
    //crea un nuevo organizador con un id
    postOrganizador(idUsuario:number):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Organizadores/create/"+idUsuario;

        let promise = new Promise((resolve, reject) =>{
            this._http.post(url+endPoint,{}).subscribe({
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

    //borra un organizador
    deleteOrganizador(idUsuario:number):Promise<any>
    {
        let url = environment.apiUrl;
        let endPoint = "/Organizadores/QuitarOrganizadorEvento/"+idUsuario;

        let promise = new Promise((resolve, reject) =>{
            this._http.delete(url+endPoint,{}).subscribe({
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