import { Component, OnInit } from '@angular/core';
import { EquipoService } from '../../services/equipo.service';
import { Equipo } from '../../models/equipo';
import { ActivatedRoute, Params } from '@angular/router';
import { ActividadesService } from '../../services/actividades.service';
import { ServiceEventos } from '../../services/evento.service';
import { ColorService } from '../../services/colores.service';

@Component({
  selector: 'app-equipo.component',
  standalone: false,
  templateUrl: './equipo.component.html',
  styleUrl: './equipo.component.css',
})
export class EquipoComponent implements OnInit{
  public equipos!: Array<Equipo>;
  public idActividad!: number;
  public idEvento!: number;
  public nombreActividad!: string;
  public fechaEvento!: string;
  public mapaColores: { [key: number]: string } = {};

  constructor(private _serviceEquipo: EquipoService, private _activateRoute: ActivatedRoute, private _serviceActividaes: ActividadesService, private _serviceEvento: ServiceEventos, private _serviceColor: ColorService){

  }

  ngOnInit(): void {
    this._activateRoute.params.subscribe((params: Params) => {
      this.idActividad = params["idactividad"];
      this.idEvento = params["idevento"];
        this._serviceEquipo.getEquiposPorActividadEvento(this.idActividad, this.idEvento).subscribe(response => {
          this.equipos = response;
          this.cargarNombresDeColores();
        })
    })

    this._serviceActividaes.getActividadesById(this.idActividad).subscribe(response => {
      this.nombreActividad = response.nombre;
    })

    this._serviceEvento.getEventoPorId(this.idEvento).subscribe(response => {
      this.fechaEvento = response.fechaEvento;
    })
  }

  cargarNombresDeColores() {
    if (!this.equipos) return;

    this.equipos.forEach(equipo => {
      const id = equipo.idColor;
      if (id && !this.mapaColores[id]) {
        this.mapaColores[id] = 'Cargando...';
        
        this._serviceColor.getColoresById(id).subscribe({
          next: (color) => {
            this.mapaColores[id] = color.nombreColor; 
          },
          error: (err) => {
            console.error(`Error cargando color ${id}`, err);
            this.mapaColores[id] = 'Error';
          }
        });
      }
    });
  }
}
