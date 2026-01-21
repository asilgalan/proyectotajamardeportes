import { Component, inject, OnChanges, OnInit, SimpleChanges, signal } from '@angular/core';
import { ServiceEventos } from '../../services/evento.service';
import { evento } from '../../models/evento';
import { ActividadesService } from '../../services/actividades.service';
import { ActividadEventoService } from '../../services/actividadEvento.service';
import { InscripcionesService } from '../../services/inscripciones.service';
import { EquipoService } from '../../services/equipo.service';
import { MiembroEquiposService } from '../../services/miembroEquipos.service';
import { forkJoin, of, switchMap } from 'rxjs';

import ServicePerfil from '../../services/perfil.service';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import Perfil from '../../models/Perfil';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit ,OnChanges{
  public eventos!: Array<evento>;
  now: string = new Date().toISOString();
  idEvento: number | null = null;
  public perfil!:Perfil;
   authservices=inject(AuthService);

  public showModalAddEvento = false;
  public fechaSeleccionada: string | null = null;

  public showModalCancelEvento = false;
  public eventoSeleccionado: any = null;
  nombre=signal<string >('');
  private actividadesService = inject(ActividadesService);
  private actividadEventoService = inject(ActividadEventoService);
  private inscripcionesService = inject(InscripcionesService);
  private equipoService = inject(EquipoService);
  private miembroEquiposService = inject(MiembroEquiposService);

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    themeSystem: 'bootstrap5',
    events: [],
    eventColor: '#2563eb',
    displayEventTime: false,
    dateClick: this.onDateClick.bind(this),
    eventClick: this.onEventClick.bind(this)
  };

  constructor(private _service: ServiceEventos, private _servicePerfil: ServicePerfil){ }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idEvento'] && !changes['idEvento'].isFirstChange()) {
      const val = changes['idEvento'].currentValue as number;
      if (val != null) this.actividadesService.getActividadesByIdEnvento(val);
    }
  }

  ngOnInit(): void {
   
    this.getEventoCurosEscolar();
  }

  getEventoCurosEscolar(){
     this._service.getEventosCursoEscolar().subscribe(response => {
      this.eventos = response;
     
      const eventosCalendario = this.eventos.map(evento => {
        const esPasado = evento.fechaEvento < this.now;
        const titulo = esPasado ? 'Evento pasado' : 'Evento futuro';
        const colorFondo = esPasado ? '#64748b' : '#2563eb';
        const colorTexto = esPasado ? '#94a3b8' : '#ffffff';

        return {
          id: evento.idEvento.toString(),
          title: titulo,
          start: evento.fechaEvento,
          backgroundColor: colorFondo,
          borderColor: colorFondo,
          textColor: colorTexto,
          classNames: [esPasado ? 'evento-pasado' : 'evento-futuro']
        };
      });
      this.calendarOptions = { ...this.calendarOptions, events: eventosCalendario };
    })
    this._servicePerfil.getPerfil().then(response => {
      this.perfil = response;
    })
  }
    

  onclickEvento(idEvento:number){
    this.idEvento=idEvento;
    this.actividadesService.getActividadesByIdEnvento(this.idEvento).subscribe();

  }

  onDateClick(arg: any) {

    if(!this.authservices.isAdmin()){
      return;
    }
    this.fechaSeleccionada = arg.dateStr;

  
    this.showModalAddEvento = true;
  }

  abrirModalCrearEvento() {
    if(!this.authservices.isAdmin()){
      return;
    }
    const hoy = new Date();
    this.fechaSeleccionada = hoy.toISOString();
    this.showModalAddEvento = true;
  }


  get fechaSeleccionadaLocal(): string {
    if (!this.fechaSeleccionada) return '';

    const date = new Date(this.fechaSeleccionada);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }


  onFechaChange(value: string) {
    if (value) {
   
      const date = new Date(value);
      this.fechaSeleccionada = date.toISOString();
    } else {
      this.fechaSeleccionada = null;
    }
  }

  cerrarModalAddEvento() {
    this.showModalAddEvento = false;
    this.fechaSeleccionada = null;
  }

  cerrarModalCancelEvento() {
    this.showModalCancelEvento = false;
    this.eventoSeleccionado = null;
  }

  confirmarAddEvento() {
    if (!this.fechaSeleccionada || this.fechaSeleccionada < this.now) return;
    
    this._service.createEvento(this.fechaSeleccionada).subscribe(()=>{
      this.getEventoCurosEscolar();
      this.cerrarModalAddEvento();
    });
  }

  onEventClick(arg: any) {
    if(!this.authservices.isAdmin()){
      return;
    }
    const idEvento = parseInt(arg.event.id);
    const evento = this.eventos.find(ev => ev.idEvento === idEvento);
    if (evento) {
      this.eventoSeleccionado = evento;
      this.showModalCancelEvento = true;
    }
  }

  confirmarCancelEvento() {
    if (!this.eventoSeleccionado || this.eventoSeleccionado.fechaEvento < this.now) return;
    
    const idEvento = this.eventoSeleccionado.idEvento;
   
    this.actividadesService.getActividadesByIdEnvento(idEvento).pipe(
      switchMap(actividades => {
        if (actividades.length === 0) {
          return this._service.deleteEventoById(idEvento);
        }
        
        const idsEventoActividad = actividades.map(act => act.idEventoActividad);
        
        //  Obtener equipos del evento y borrar miembros
        return this.equipoService.getEquiposPorEvento(idEvento).pipe(
          switchMap(equipos => {
            if (equipos.length === 0) {
              return of(null);
            }
            // Obtener todos los miembros de todos los equipos
            const getMiembrosRequests = equipos.map(eq => 
              this.equipoService.getUsuariosPorEquipo(eq.idEquipo)
            );
            return forkJoin(getMiembrosRequests).pipe(
              switchMap(miembrosArrays => {
                const todosMiembros = miembrosArrays.flat();
                if (todosMiembros.length === 0) {
                  return of(null);
                }
                // Borrar todos los miembros
                const deleteMiembros = todosMiembros.map((m: any) => 
                  this.miembroEquiposService.deleteMiembroEquiposPorId(m.idMiembroEquipo)
                );
                return forkJoin(deleteMiembros);
              }),
             // Borrar equipos
              switchMap(() => {
                const deleteEquipos = equipos.map(eq => 
                  this.equipoService.deleteEquipoPorId(eq.idEquipo)
                );
                return forkJoin(deleteEquipos);
              })
            );
          }),
          // Borrar inscripciones
          switchMap(() => this.inscripcionesService.getInscripciones()),
          switchMap((todasInscripciones: any) => {
            const inscripcionesEvento = todasInscripciones.filter((insc: any) => 
              idsEventoActividad.includes(insc.idEventoActividad)
            );
            if (inscripcionesEvento.length > 0) {
              const deleteInscripciones = inscripcionesEvento.map((insc: any) => 
                this.inscripcionesService.deleteInscripcionById(insc.idInscripcion)
              );
              return forkJoin(deleteInscripciones);
            }
            return of(null);
          }),
          // Borrar ActividadEvento
          switchMap(() => {
            const deleteActividades = actividades.map(act => 
              this.actividadEventoService.deleteActividadEvento(act.idEventoActividad)
            );
            return forkJoin(deleteActividades);
          }),
          //Borrar evento
          switchMap(() => this._service.deleteEventoById(idEvento))
        );
      })
    ).subscribe({
      next: () => {
        this.getEventoCurosEscolar();
        this.cerrarModalCancelEvento();
      },
      error: (err) => {
        console.error('Error al eliminar evento:', err);
        alert('Error al eliminar el evento. Revisa la consola.');
      }
    });
  }
}
