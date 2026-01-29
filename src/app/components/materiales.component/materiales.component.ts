import { Component, OnInit } from '@angular/core';
import { ServiceEventos } from '../../services/evento.service';
import { evento } from '../../models/evento';
import { actividadEvento } from '../../models/actividadEvento';
import { ActividadesService } from '../../services/actividades.service';
import Swal from 'sweetalert2';
import Material from '../../models/material';
import ServicePerfil from '../../services/perfil.service';
import ServiceMateriales from '../../services/materiales.service';
import { ActividadEventoService } from '../../services/actividadEvento.service';

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
  public materialesActividad: Array<Material> = new Array<Material>();

  public idEventoActividadSeleccionado: number = 1;

  public idEventoSeleccionado: number | null = null;
  public idActividadSeleccionada: number | null = null;

  public idUsuario!: number;

  constructor(private _serviceEventos: ServiceEventos,
    private _serviceActividades: ActividadesService,
    private _servicePerfil: ServicePerfil,
    private _serviceMateriales: ServiceMateriales,
    private _serviceEventoActividad: ActividadEventoService) { }

  ngOnInit(): void 
  {
    this._serviceEventos.getEventosCursoEscolar().subscribe((response) => 
    {
      this.eventos = response;
    });

    this._servicePerfil.getPerfil().then(response => 
    {
      this.idUsuario = response.idUsuario;
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

  seleccionarActividad(idEvento: number, idActividad: number, event: Event): void 
  {
    event.stopPropagation();

    if (this.idActividadSeleccionada === idActividad) 
    {
      this.idActividadSeleccionada = null;
      this.materialesActividad = [];
    }
    else 
    {
      this.idActividadSeleccionada = idActividad;

      this._serviceEventoActividad.getActividadesEventoByEventoidByActividadid(idEvento, idActividad).subscribe((response) => 
      {
        this.idEventoActividadSeleccionado = response.idEventoActividad;

        this._serviceMateriales.getMaterialesActividad(this.idEventoActividadSeleccionado).then(response => 
        {
          this.materialesActividad = response;
        });
      });
    }
  }

  aceptarMaterial(material: Material, event: Event): void 
{
    event.stopPropagation();

    let idUsuario: number;
    let idMaterial: number = material.idMaterial;

    this._servicePerfil.getPerfil().then(response => 
    {
      idUsuario = response.idUsuario;

      this._serviceMateriales.putMaterialAceptado(idMaterial, idUsuario).then(response => 
      {
        this._serviceMateriales.getMaterialesActividad(this.idEventoActividadSeleccionado).then(response => 
        {
          this.materialesActividad = response;
        });
      })
    });
  }

  proporcionarMaterial(idEvento: number, idActividad: number, event: Event): void 
  {
    event.stopPropagation();

    Swal.fire
      ({
        title: 'Proporcionar material',
        html: `
        <p>¿Qué material quieres proporcionar?</p>
        <input id="materialInput" class="swal2-input" />
      `,
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => 
        {
          const valor = (document.getElementById('materialInput') as HTMLInputElement).value;

          if (!valor) {
            Swal.showValidationMessage('Debes indicar un material');
          }

          return valor;
        }
      }).then(result => 
      {
        if (result.isConfirmed) 
        {
          let idEventoActividad: number = 0;
          let idUsuario: number;

          this._servicePerfil.getPerfil().then(response => 
          {
            idUsuario = response.idUsuario;

            this._serviceEventoActividad.getActividadesEventoByEventoidByActividadid(idEvento, idActividad).subscribe((response) => 
            {
              idEventoActividad = response.idEventoActividad;

              const material = new Material(0, idEventoActividad, idUsuario, result.value, true, new Date().toISOString(), 0);

              this._serviceMateriales.postMaterial(material).then(response => 
              {
                const idMaterial = response.idMaterial;

                this._serviceMateriales.putMaterialAceptado(idMaterial, idUsuario).then(() => 
                {
                  this._serviceMateriales.getMaterialesActividad(idEventoActividad).then(response => 
                  {
                    this.materialesActividad = response;
                  });
                });
              });
            });
          });
        }
      });
  }

  solicitarMaterial(idEvento: number, idActividad: number, event: Event): void 
{
    event.stopPropagation();

    Swal.fire
      ({
        title: 'Solicitar material',
        html: `
        <p>¿Qué material quieres solicitar?</p>
        <input id="materialInput" class="swal2-input" />
      `,
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => 
        {
          const valor = (document.getElementById('materialInput') as HTMLInputElement).value;

          if (!valor) 
          {
            Swal.showValidationMessage('Debes indicar un material');
          }

          return valor;
        }
      }).then(result => 
      {
        if (result.isConfirmed) 
        {
          let idEventoActividad: number = 1;
          let idUsuario: number;

          this._servicePerfil.getPerfil().then(response => 
          {
            idUsuario = response.idUsuario;

            this._serviceEventoActividad.getActividadesEventoByEventoidByActividadid(idEvento, idActividad).subscribe((response) => 
            {
              idEventoActividad = response.idEventoActividad;

              const material = new Material(0, idEventoActividad, idUsuario, result.value, true, new Date().toISOString(), 0);

              this._serviceMateriales.postMaterial(material).then(response => 
              {
                this._serviceMateriales.getMaterialesActividad(idEventoActividad).then(response => 
                {
                  this.materialesActividad = response;
                });
              })
            });

          });
        }
      });
  }
}
