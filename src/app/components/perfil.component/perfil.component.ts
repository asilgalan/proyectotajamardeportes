import { Component, OnInit } from '@angular/core';
import Perfil from '../../models/Perfil';
import ServicePerfil from '../../services/perfil.service';
import Swal from 'sweetalert2';

@Component
({
  selector: 'app-perfil',
  standalone: false,
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit
{
  public perfil!:Perfil

  public eventos:Array<number> = new Array<number>
  public actividadesEvento!:Array<number>

  constructor(private _service:ServicePerfil) {}

  ngOnInit(): void 
  {
    this._service.getPerfil().then(response =>
    {
      this.perfil = response;

      //hay que sacar los eventos por usuario
    })
  }
  
  mostrarDetalles(): void 
  {
      Swal.fire
      ({
        title: 'Detalles del Usuario',
        html: `
          <div class="swal-profile">

            <div class="swal-row">
              <span class="swal-label">Nombre: </span>
              <span class="swal-value">${this.perfil.nombre}</span>
            </div>

            <div class="swal-row">
              <span class="swal-label">Apellidos: </span>
              <span class="swal-value">${this.perfil.apellidos}</span>
            </div>

            <div class="swal-row">
              <span class="swal-label">Email: </span>
              <span class="swal-value">${this.perfil.email}</span>
            </div>

            <div class="swal-row">
              <span class="swal-label">Curso actual: </span>
              <span class="swal-value">${this.perfil.curso}</span>
            </div>
          </div>
        `,
        showCloseButton: true,
        showConfirmButton: false,
        buttonsStyling: false,
        customClass: {
          popup: 'swal-popup custom-navbar',
          title: 'swal-title'
        }
      });
  }

  seleccionarEventos(evento:number): void
  {
    //hay que sacar las actividades por usuario
  }
}
