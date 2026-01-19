import { Component, OnInit } from '@angular/core';
import { ServiceEventos } from '../../services/evento.service';
import { evento } from '../../models/evento';
import { actividadEvento } from '../../models/actividadEvento';
import { ActividadesService } from '../../services/actividades.service';

@Component
({
  selector: 'app-materiales.component',
  standalone: false,
  templateUrl: './materiales.component.html',
  styleUrls: ['./materiales.component.css'],
})
export class MaterialesComponent implements OnInit
{
  public eventos: Array<evento> = new Array<evento>();
  public actividadesEvento: Array<actividadEvento> = new Array<actividadEvento>();

  public idEventoSeleccionado: number | null = null;

  constructor(private _serviceEventos: ServiceEventos,
              private _serviceActividades: ActividadesService) {}

  ngOnInit(): void
  {
    this._serviceEventos.getEventosCursoEscolar().subscribe((response) =>
    {
      this.eventos = response;
    });
  }

  seleccionarEvento(idEvento: number): void
  {
    if (this.idEventoSeleccionado === idEvento) 
    {
      this.idEventoSeleccionado = null;
      this.actividadesEvento = [];
      return;
    }

    this._serviceActividades.getActividadesByIdEnvento(idEvento).subscribe((response) =>
    {
      this.idEventoSeleccionado = idEvento;
      this.actividadesEvento = response;
    });
  }

  seleccionarActividad(idEvento:number, idActividad:number): void
  {
    
  }
}
