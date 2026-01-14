import { Component, OnInit } from '@angular/core';
import Perfil from '../../models/Perfil';
import ServicePerfil from '../../services/perfil.service';


@Component
({
  selector: 'app-perfil',
  standalone: false,
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent implements OnInit
{
  public perfil!:Perfil

  constructor(private _service:ServicePerfil) { }

  ngOnInit(): void 
  {
    //this.perfil = 
    //new Perfil(1, 'María', 'Pérez', 'maria.perez@email.com', true,  
    //          'https://i.pravatar.cc/150?img=12', 2, 'Administradora',    
    //           101, 'Angular Avanzado', 1001);             


    let token = localStorage.getItem('token');
    if (!token)
    {
      //si no esta, volver al inicio de sesion
    }

    this._service.getPerfil(token).then(response =>
    {
      this.perfil = response;
    }) 
  }

   mostrarDetalles(): void 
   {
    let mensaje =
      `Detalles del Usuario\n` +
      `Nombre: ${this.perfil.nombre}\n` +
      `Apellidos: ${this.perfil.apellidos}\n` +
      `Email: ${this.perfil.email}\n` +
      `Curso Actual: ${this.perfil.curso}\n` +
      `Estado: ${this.perfil.estadoUsuario}`;

    alert(mensaje);
}

}
