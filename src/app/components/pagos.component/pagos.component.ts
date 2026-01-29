import { Component, OnInit } from '@angular/core';
import { ServiceEventos } from '../../services/evento.service';
import { evento } from '../../models/evento';
import { actividadEvento } from '../../models/actividadEvento';
import { ActividadesService } from '../../services/actividades.service';
import ServicePrecioActividad from '../../services/precioActividad.service';
import PrecioActividad from '../../models/precioActividad';
import { ActividadEventoService } from '../../services/actividadEvento.service';
import { ViewChild, ElementRef } from '@angular/core';
import { Curso } from '../../models/curso';
import ServiceGestion from '../../services/gestion.service';
import ServicePagos from '../../services/pagos.service';

@Component({
  selector: 'app-pagos.component',
  standalone: false,
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css'],
})
export class PagosComponent implements OnInit 
{
  public eventosPrecios: evento[] = [];
  public actividadesPrecios: actividadEvento[] = [];
  
  @ViewChild('eventoPrecio') eventoPrecio!: ElementRef;
  @ViewChild('actividadPrecio') actividadPrecio!: ElementRef;
  @ViewChild('precioInput') precioInput!: ElementRef;

  public eventosPagos: evento[] = [];
  public actividadesPagos: actividadEvento[] = [];
  public cursos: Curso[] = [];

  @ViewChild('eventoPago') eventoPago!: ElementRef;
  @ViewChild('actividadPago') actividadPago!: ElementRef;
  @ViewChild('cursosPago') cursosPago!: ElementRef;

  public coste!: number;

  public mostrarToast: boolean = false;
  public toastMensaje: string = '';
  public tipoToast: 'success' | 'info' | 'error' = 'success';
  public iconoToast: string = '✔';

  constructor(private _serviceEventos: ServiceEventos,
              private _serviceActividad: ActividadesService,
              private _servicePrecios: ServicePrecioActividad,
              private _serviceEventoActividad:ActividadEventoService,
              private _serviceGestion:ServiceGestion,
              private _servicePagos:ServicePagos){}

  ngOnInit(): void 
  {
    this._serviceEventos.getEventosCursoEscolar().subscribe((response) => 
    {
      this.eventosPrecios = response;
      this.eventosPagos = response;
    });

    this._serviceGestion.getCursosActivos().then((response) =>
    {
      this.cursos = response;
    });
  }

  seleccionarEventoPrecio(): void 
  {
    let idEvento = Number(this.eventoPrecio.nativeElement.value);
    this.actividadesPrecios = [];

    this._serviceActividad.getActividadesByIdEnvento(idEvento).subscribe(actividades => 
    {
      for (let actividad of actividades) 
      {
        this._serviceEventoActividad.getActividadesEventoByEventoidByActividadid(idEvento, actividad.idActividad).subscribe(eventoActividad => 
        {
          this._servicePrecios.findIdPrecioPorIdEventoActividad(eventoActividad.idEventoActividad).then(precio => 
            {
              if (precio == null) 
              {
                this.actividadesPrecios.push(actividad);
              }

            });
        });
      }
    });
  }

  insertarPrecio(): void 
  {
    let idEventoActividad:number;

    let idActividad = Number(this.actividadPrecio.nativeElement.value);
    let idEvento = Number(this.eventoPrecio.nativeElement.value);
    let cantidad = Number(this.precioInput.nativeElement.value);

    this._serviceEventoActividad.getActividadesEventoByEventoidByActividadid(idEvento, idActividad).subscribe(response =>
    {
      idEventoActividad = response.idEventoActividad;

      let precio = new PrecioActividad(0, idEventoActividad, cantidad);
  
      this._servicePrecios.postPrecio(precio).then((response) => 
      {
        this.mostrarToastMensaje('Precio insertado correctamente', 'success');
      });
    });
  }

  seleccionarEventoPago(): void 
  {
    let idEvento = Number(this.eventoPago.nativeElement.value);
    this.actividadesPagos = [];

    this._serviceActividad.getActividadesByIdEnvento(idEvento).subscribe(actividades => 
    {
      this._servicePagos.getPagosEvento(idEvento).then(pagos => 
      {
        for (let actividad of actividades) 
        {
          let estaPagada = false;

          for (let pago of pagos) 
          {
            if (pago.idActividad === actividad.idActividad) 
            {
              if (pago.estado === 'PAGADO') 
              {
                estaPagada = true;
              }
            }
          }
          if (!estaPagada) 
          {
            this.actividadesPagos.push(actividad);
          }
        }
      });
    });
  }

  calcularCoste(): void
  {
    let idEventoActividad:number;
    let idPrecioActividad:number;

    let idActividad = Number(this.actividadPago.nativeElement.value);
    let idEvento = Number(this.eventoPago.nativeElement.value);

    this._serviceEventoActividad.getActividadesEventoByEventoidByActividadid(idEvento, idActividad).subscribe(response =>
    {
      idEventoActividad = response.idEventoActividad;

         this._servicePrecios.findIdPrecioPorIdEventoActividad(idEventoActividad).then(response =>
         {
          idPrecioActividad = response.idPrecioActividad;
 
          this._servicePrecios.findPrecioActividad(idPrecioActividad).then(response =>
          {
            this.coste = response.precioTotal;
            this.mostrarToastMensaje('El coste de la actividad es ' + this.coste, 'info');
          });
        });
    });
  }

  insertarPago():void
  {
    let idEventoActividad:number;
    let idCurso = Number(this.cursosPago.nativeElement.value);

    let idActividad = Number(this.actividadPago.nativeElement.value);
    let idEvento = Number(this.eventoPago.nativeElement.value);

    this._serviceEventoActividad.getActividadesEventoByEventoidByActividadid(idEvento, idActividad).subscribe(response =>
    {
      idEventoActividad = response.idEventoActividad;

      this._servicePagos.postPagoPagado(idEventoActividad, idCurso, this.coste).then(response =>
      {
        this.mostrarToastMensaje('Pago realizado correctamente', 'success');
      });
    });
  }

  mostrarToastMensaje(mensaje: string, tipo: 'success' | 'info' | 'error'): void
  {
    this.toastMensaje = mensaje;
    this.tipoToast = tipo;

    switch (tipo)
    {
      case 'success':
        this.iconoToast = '✔';
        break;
      case 'info':
        this.iconoToast = 'ℹ';
        break;
      case 'error':
        this.iconoToast = '✖';
        break;
    }

    this.mostrarToast = true;

    setTimeout(() =>
    {
      this.mostrarToast = false;
    }, 3500);
  }
}