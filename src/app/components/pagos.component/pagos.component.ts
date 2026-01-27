import { Component, OnInit } from '@angular/core';
import { ServiceEventos } from '../../services/evento.service';
import { evento } from '../../models/evento';
import { actividadEvento } from '../../models/actividadEvento';
import { ActividadesService } from '../../services/actividades.service';
import ServicePrecioActividad from '../../services/precioActividad.service';
import PrecioActividad from '../../models/precioActividad';
import { ActividadEventoService } from '../../services/actividadEvento.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagos.component',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css'],
})
export class PagosComponent implements OnInit 
{
  public eventos: evento[] = [];
  public actividades: actividadEvento[] = [];

  public eventoSeleccionado!: number;
  public actividadSeleccionada!: number;
  public precioActividad!: number;

  constructor(private _serviceEventos: ServiceEventos,
              private _serviceActividad: ActividadesService,
              private _servicePrecios: ServicePrecioActividad,
              private _serviceEventoActividad:ActividadEventoService) {}

  ngOnInit(): void 
  {
    this._serviceEventos.getEventosCursoEscolar().subscribe((response) => 
    {
      this.eventos = response;
    });
  }

  seleccionarEvento(idEvento: number): void 
  {
    this._serviceActividad.getActividadesByIdEnvento(idEvento).subscribe((response) => 
    {
      this.actividades = response;
      this.actividadSeleccionada = 0;
    });
  }

  insertarPrecio(idActividad: number, idEvento:number, cantidad: number): void 
  {
    let idEventoActividad:number;

    this._serviceEventoActividad.getActividadesEventoByEventoidByActividadid(idActividad, idEvento).subscribe(response =>
    {
      idEventoActividad = response;

      let precio = new PrecioActividad(0, idEventoActividad, cantidad);
  
      this._servicePrecios.postPrecio(precio).then((response) => 
      {
        console.log('Precio insertado:', response);
      });
    })
  }
}
