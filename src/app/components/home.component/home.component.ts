import { Component, inject, OnChanges, OnInit, SimpleChanges, signal } from '@angular/core';
import { ServiceEventos } from '../../services/evento.service';
import { evento } from '../../models/evento';
import { ActividadesService } from '../../services/actividades.service';
import { ActividadEventoService } from '../../services/actividadEvento.service';
import { InscripcionesService } from '../../services/inscripciones.service';
import { EquipoService } from '../../services/equipo.service';
import { MiembroEquiposService } from '../../services/miembroEquipos.service';
import ServicePrecioActividad from '../../services/precioActividad.service';
import { ProfesorEventoService } from '../../services/ProfesoresEvento.service';
import { ProfesorEvento } from '../../interface/profesoreEvento.interface';
import { forkJoin, of, switchMap, from } from 'rxjs';

import ServicePerfil from '../../services/perfil.service';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import Perfil from '../../models/perfil';
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
  public idProfesorNuevoEvento: number | null = null; 

  public showModalCancelEvento = false;
  public eventoSeleccionado: any = null;
  public showModalEditarEvento = false;
  public showModalEliminarEvento = false;
  public showModalError = false;
  public mensajeError = '';
  nombre=signal<string >('');
  
  // Campos para editar evento
  public fechaEditar: string = '';
  public idProfesorEditar: number | null = null;
  public profesoresActivos: ProfesorEvento[] = [];
  public profesorActualEvento: number | null = null; // Para saber qué profesor tenía originalmente
  
  private actividadesService = inject(ActividadesService);
  private actividadEventoService = inject(ActividadEventoService);
  private inscripcionesService = inject(InscripcionesService);
  private equipoService = inject(EquipoService);
  private miembroEquiposService = inject(MiembroEquiposService);
  private precioActividadService = inject(ServicePrecioActividad);
  private profesorEventoService = inject(ProfesorEventoService);

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
    
  
    this.cargarProfesores();
  }
  
  cargarProfesores() {
 
    this.profesorEventoService.getProfesoresActivos().subscribe({
      next: (profesores) => {
  
        this.profesoresActivos = profesores;
      },
      error: (err) => {
        console.error('❌ Error al cargar profesores:', err);
      }
    });
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
    this.idProfesorNuevoEvento = null;
  }

  cerrarModalCancelEvento() {
    this.showModalCancelEvento = false;
    this.eventoSeleccionado = null;
  }

  abrirModalEditarEvento(event: Event, evento: evento) {
    event.stopPropagation();
    this.eventoSeleccionado = evento;
    this.fechaEditar = evento.fechaEvento.split('T')[0]; 
    this.idProfesorEditar = evento.idProfesor || null;
    this.profesorActualEvento = evento.idProfesor || null; 
    this.showModalEditarEvento = true;
  }

  cerrarModalEditarEvento() {
    this.showModalEditarEvento = false;
    this.eventoSeleccionado = null;
    this.fechaEditar = '';
    this.idProfesorEditar = null;
    this.profesorActualEvento = null;
  }

  guardarCambiosEvento() {
    if (!this.eventoSeleccionado || !this.fechaEditar) return;

    const eventoActualizado = new evento(
      this.eventoSeleccionado.idEvento,
      this.fechaEditar,
      this.idProfesorEditar || 0
    );


    this._service.updateEvento(eventoActualizado).pipe(
      switchMap(() => {

        const profesorCambio = this.idProfesorEditar !== this.profesorActualEvento;
        
        if (!profesorCambio) {
        
          return of('sin-cambio-profesor');
        }

   
        if (this.profesorActualEvento && this.profesorActualEvento > 0) {
        
          return this.profesorEventoService.deleteProfesorEventoById(this.eventoSeleccionado.idEvento).pipe(
            switchMap(() => {
             
              if (this.idProfesorEditar && this.idProfesorEditar > 0) {
              
                return this.profesorEventoService.createProfesorEvento(this.eventoSeleccionado.idEvento, this.idProfesorEditar);
              }
              return of('profesor-eliminado');
            })
          );
        } else {
        
          if (this.idProfesorEditar && this.idProfesorEditar > 0) {
        
            return this.profesorEventoService.createProfesorEvento(this.eventoSeleccionado.idEvento, this.idProfesorEditar);
          }
          return of('sin-profesor');
        }
      })
    ).subscribe({
      next: () => {
 
        this.cerrarModalEditarEvento();
        this.getEventoCurosEscolar();
      },
      error: (err) => {
     
        this.mensajeError = 'No se pudo actualizar el evento';
        this.showModalError = true;
      }
    });
  }

  abrirModalEliminarEvento() {
    this.showModalEliminarEvento = true;
  }

  cerrarModalEliminarEvento() {
    this.showModalEliminarEvento = false;
  }

  cerrarModalError() {
    this.showModalError = false;
    this.mensajeError = '';
  }

  confirmarAddEvento() {
    if (!this.fechaSeleccionada || this.fechaSeleccionada < this.now) return;
    
    this._service.createEvento(this.fechaSeleccionada).pipe(
      switchMap((eventoCreado) => {
      
        // Si se seleccionó un profesor, crear la asociación
        if (this.idProfesorNuevoEvento && this.idProfesorNuevoEvento > 0) {
         
          return this.profesorEventoService.createProfesorEvento(eventoCreado.idEvento, this.idProfesorNuevoEvento);
        }
        return of('sin-profesor');
      })
    ).subscribe({
      next: () => {
    
        this.getEventoCurosEscolar();
        this.cerrarModalAddEvento();
      },
      error: (err) => {
      
        this.mensajeError = 'No se pudo crear el evento.\n\nIntenta nuevamente.';
        this.showModalError = true;
      }
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
      this.fechaEditar = evento.fechaEvento.split('T')[0];
      this.idProfesorEditar = evento.idProfesor || null;
      this.profesorActualEvento = evento.idProfesor || null; 
      this.showModalEditarEvento = true;
    }
  }

  confirmarEliminarEvento() {
    const idEvento = this.eventoSeleccionado?.idEvento;
    if (!idEvento) return;

  

   
    this.equipoService.getEquiposPorEvento(idEvento)
      .pipe(
        switchMap(equipos => {
      
          if (equipos.length === 0) {
            return of('sin-equipos');
          }

        
          const deleteMiembros$ = equipos.map(equipo =>
            this.miembroEquiposService.getMiembroEquipos().pipe(
              switchMap(miembros => {
                const miembrosDelEquipo = miembros.filter(m => m.idEquipo === equipo.idEquipo);
            
                if (miembrosDelEquipo.length === 0) return of('sin-miembros');
                return forkJoin(
                  miembrosDelEquipo.map(m => this.miembroEquiposService.deleteMiembroEquiposPorId(m.idMiembroEquipo))
                );
              })
            )
          );

          return forkJoin(deleteMiembros$).pipe(
            switchMap((resultMiembros) => {
            
              // Eliminar todos los equipos
              return forkJoin(
                equipos.map(equipo => this.equipoService.deleteEquipoPorId(equipo.idEquipo))
              );
            })
          );
        }),
        switchMap((resultEquipos) => {
        
          // Luego eliminar todas las inscripciones del evento
          return this.inscripcionesService.getInscripciones();
        }),
        switchMap((inscripciones: any) => {
          // Obtener actividades del evento para filtrar inscripciones
          return this.actividadesService.getActividadesByIdEnvento(idEvento).pipe(
            switchMap(actividades => {
             
              const idsEventoActividad = actividades.map(act => act.idEventoActividad);
              const inscripcionesDelEvento = (inscripciones as any[]).filter(
                i => idsEventoActividad.includes(i.idEventoActividad)
              );

          
              if (inscripcionesDelEvento.length === 0) {
                return of({ actividades, inscripcionesEliminadas: 'sin-inscripciones' });
              }

              return forkJoin(
                inscripcionesDelEvento.map(i =>
                  this.inscripcionesService.deleteInscripcionById(i.idInscripcion)
                )
              ).pipe(
                switchMap((resultInscripciones) => {
                
                  return of({ actividades, inscripcionesEliminadas: true });
                })
              );
            })
          );
        }),
        // Eliminar todas las relaciones ActividadEvento
        switchMap((result: any) => {
          const actividades = result.actividades;
         
          
          if (actividades.length === 0) {
           
            return of('sin-actividades');
          }

          // Eliminar una por una para ver cuál falla
          const deleteOneByOne = (index: number): any => {
            if (index >= actividades.length) {
            
              return of('completado');
            }

            const act = actividades[index];
           
            
            // Primero eliminar los PrecioActividad asociados
            return from(this.precioActividadService.getPrecioActividad()).pipe(
              switchMap(precios => {
                const preciosDeEstaActividad = (precios as any[]).filter(
                  p => p.idEventoActividad === act.idEventoActividad
                );
             
                
                if (preciosDeEstaActividad.length === 0) {
                  return of('sin-precios');
                }
                
                // Eliminar todos los precios
                const deletePrecios$ = preciosDeEstaActividad.map(p => 
                  from(this.precioActividadService.deletePrecioActividad(p.idPrecioActividad))
                );
                return forkJoin(deletePrecios$);
              }),
              switchMap(() => {
               
                // Ahora sí eliminar el ActividadEvento
                return this.actividadEventoService.deleteActividadEvento(act.idEventoActividad);
              }),
              switchMap(() => {
               
                return deleteOneByOne(index + 1);
              })
            );
          };

          return deleteOneByOne(0);
        }),
        // Finalmente eliminar el evento
        switchMap(() => {
          
          return this._service.deleteEventoById(idEvento);
        })
      )
      .subscribe({
        next: () => {
         
          this.cerrarModalEliminarEvento();
          this.cerrarModalEditarEvento();
          this.getEventoCurosEscolar();
          if (this.idEvento === idEvento) {
            this.idEvento = null;
          }
        },
        error: (err) => {
     
          this.cerrarModalEliminarEvento();
          this.mensajeError = ' No se pudo eliminar el evento.';
          this.showModalError = true;
        }
      });
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
      
        this.mensajeError = 'No se pudo cancelar el evento.';
        this.showModalError = true;
      }
    });
  }

  esActividadDeEquipo(nombreActividad: string): boolean {
    const nombre = nombreActividad.toLowerCase();
    return nombre.includes('futbol') || nombre.includes('fútbol') ||
      nombre.includes('baloncesto') || nombre.includes('basket');
  }
}
