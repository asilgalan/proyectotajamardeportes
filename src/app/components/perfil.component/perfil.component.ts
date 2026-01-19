import { Component, OnInit } from '@angular/core';
import Perfil from '../../models/perfil';
import ServicePerfil from '../../services/perfil.service';
import Swal from 'sweetalert2';
import {evento} from '../../models/evento';


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

  public eventos:Array<evento> = new Array<evento>
  public idEventoSeleccionado: number | null = null;

  public nombreActividad!:string;
  public quiereSerCapitan!:boolean;
  public fechaInscripcion!: string;

  constructor(private _servicePerfil:ServicePerfil) {}

  ngOnInit(): void 
  {
    this._servicePerfil.getPerfil().then(response =>
    {
      this.perfil = response;

      this._servicePerfil.getEventosYActividades().then(response =>
      {
        for (let i = 0; i < response.length; i++) 
        {
          const ev = new evento(
            response[i].idEvento,
            response[i].fechaEvento, 0);

          this.eventos.push(ev);
        }
      })
    })
  }

 seleccionarEvento(evento: number) 
  {
    if (this.idEventoSeleccionado === evento) 
    {
      this.idEventoSeleccionado = null;
      this.nombreActividad = '';
      this.quiereSerCapitan = false;
      this.fechaInscripcion = '';
      return;
    }

    this._servicePerfil.getEventosYActividades().then(response => 
    {
      for (let i = 0; i < response.length; ++i) 
      {
        if (response[i].idEvento == evento) 
        {
          this.idEventoSeleccionado = evento;

          this.nombreActividad = response[i].nombreActividad;
          this.quiereSerCapitan = response[i].quiereSerCapitan;
          this.fechaInscripcion = response[i].fechaInscripcion;
        }
      }
    });
  }
}
