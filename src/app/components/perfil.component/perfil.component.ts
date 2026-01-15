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

    this._service.getPerfil().then(response =>
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
