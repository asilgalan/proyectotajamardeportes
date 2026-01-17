import { Component, OnInit } from '@angular/core';
import Perfil from '../../models/perfil';
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

  //ejemplo
  idEvento: number | null = null;

  constructor(private _service:ServicePerfil) 
  {
    //prueba eventos
    this.eventos.push(1)
    this.eventos.push(2)
    this.eventos.push(3)

    this.idEvento = 1;
  }

  ngOnInit(): void 
  {
    this._service.getPerfil().then(response =>
    {
      this.perfil = response;

      //hay que sacar los eventos por usuario
    })
  }

  seleccionarEvento(evento: any) 
  {
    // Si ya estaba seleccionado, lo colapsamos
    if (this.idEvento == evento) 
    {
      this.idEvento = null;
    } 
    else 
    {
      this.idEvento = evento;
    }
  }

}
