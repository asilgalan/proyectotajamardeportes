import { Component, inject, OnChanges, OnInit, SimpleChanges, signal, computed, effect } from '@angular/core';
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
import { forkJoin, of, switchMap, from, firstValueFrom, catchError, map } from 'rxjs';

import ServicePerfil from '../../services/perfil.service';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import Perfil from '../../models/perfil';
import { AuthService } from '../../auth/services/auth.service';
import { CapitanActividadService } from '../../services/capitanActividad.service';
import { CapitanActividad } from '../../interface/capitanActividad.interface';
import { ActividadEventoResponse } from '../../interface/actividades.interface';
import ServiceOrganizadores from '../../services/organizadores.service';

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
   organizadorService=inject(ServiceOrganizadores);

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
  public isOrganizador: boolean = false;
  
  // Campos para editar evento
  public fechaEditar: string = '';
  public idProfesorEditar: number | null = null;
  public profesoresActivos: ProfesorEvento[] = [];
  public profesorActualEvento: number | null = null; // Para saber qué profesor tenía originalmente
  
  // Señales para sorteo de capitanes
  sorteoEnProgreso = signal<boolean>(false);
  capitanesDelUsuario = signal<CapitanActividad[]>([]);
  actividadesDelEvento = signal<ActividadEventoResponse[]>([]);

  private organizadorVerificado = false;
  
  // Computed signal para verificar si el usuario es capitán de alguna actividad
  esCapitanDeActividad = computed(() => {
    const userId = this.authservices.currentUser()?.idUsuario;
    if (!userId) return false;
    return this.capitanesDelUsuario().some(c => c.idUsuario === userId);
  });

  
  // Computed signal para obtener las actividades donde el usuario es capitán
  actividadesDondeEsCapitan = computed(() => {
    const userId = this.authservices.currentUser()?.idUsuario;
    if (!userId) return [];
    return this.capitanesDelUsuario()
      .filter(c => c.idUsuario === userId)
      .map(c => c.idEventoActividad);
  });
  
  private actividadesService = inject(ActividadesService);
  private actividadEventoService = inject(ActividadEventoService);
  private inscripcionesService = inject(InscripcionesService);
  private equipoService = inject(EquipoService);
  private miembroEquiposService = inject(MiembroEquiposService);
  private precioActividadService = inject(ServicePrecioActividad);
  private profesorEventoService = inject(ProfesorEventoService);
  private capitanActividadService = inject(CapitanActividadService);

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

  constructor(private _service: ServiceEventos, private _servicePerfil: ServicePerfil){
    effect(() => {
      const userId = this.authservices.currentUser()?.idUsuario;
      if (userId && !this.organizadorVerificado) {
        this.organizadorVerificado = true;
        this.verificarSiEsOrganizador();
      }
    });
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idEvento'] && !changes['idEvento'].isFirstChange()) {
      const val = changes['idEvento'].currentValue as number;
      if (val != null) this.actividadesService.getActividadesByIdEnvento(val);
    }
  }

  ngOnInit(): void {
   
    this.getEventoCurosEscolar();
    this.cargarCapitanesDelUsuario();
    
  }

  verificarSiEsOrganizador(): void {
    const userId = this.authservices.currentUser()?.idUsuario;
    console.log('verificarSiEsOrganizador - userId:', userId);
    if (!userId) {
      console.log('No hay userId, abortando');
      return;
    }
    console.log('Llamando a organizadorService.isOrganizador()...');
    this.organizadorService.isOrganizador(userId)
      .subscribe({
        next: (isOrganizador) => {
          console.log('Respuesta de isOrganizador:', isOrganizador);
          this.isOrganizador = isOrganizador;
          console.log('this.isOrganizador actualizado a:', this.isOrganizador);
        },
        error: (error) => {
          console.error('Error al verificar si es organizador:', error);
          this.isOrganizador = false;
        }
      });
  }

  getEventoCurosEscolar(){
     this._service.getEventosCursoEscolar().subscribe(response => {
      this.eventos = response;
     
      const eventosCalendario = this.eventos.map(evento => {
        const esPasado = evento.fechaEvento < this.now;
        const titulo = esPasado ? 'Evento pasado' : 'Evento futuro';
        const colorFondo = esPasado ? '#64748b' : '#2563eb';
        const colorTexto = esPasado ? '#94a3b8' : '#2563eb';

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
    this.profesorEventoService.getProfesoresSinEvento()
      .pipe(
        catchError((err) => {
          if (err?.status === 404) {
            console.warn('Endpoint ProfesSinEvento no encontrado, usando ProfesActivos como fallback');
            return this.profesorEventoService.getProfesoresActivos();
          }
          console.error('❌ Error al cargar profesores:', err);
          return of([] as ProfesorEvento[]);
        })
      )
      .subscribe({
        next: (profesores) => {
          this.profesoresActivos = profesores;
        }
      });
  }
    

  onclickEvento(idEvento:number){
    this.idEvento=idEvento;
    this.actividadesService.getActividadesByIdEnvento(this.idEvento).subscribe();

  }

  onDateClick(arg: any) {
    console.log('onDateClick llamado');
    console.log('isAdmin:', this.authservices.isAdmin());
    console.log('isOrganizador:', this.isOrganizador);

    if(!this.authservices.isAdmin() && !this.organizadorService.esOrganizador()){
      console.log('Acceso denegado');
      return;
    }
    console.log('Acceso permitido, abriendo modal');
    this.fechaSeleccionada = arg.dateStr;

  
    this.showModalAddEvento = true;
  }

  abrirModalCrearEvento() {
    console.log('abrirModalCrearEvento llamado');
    console.log('isAdmin:', this.authservices.isAdmin());
    console.log('isOrganizador:', this.isOrganizador);
    
    if(!this.authservices.isAdmin() && !this.isOrganizador){
      console.log('Acceso denegado');
      return;
    }
    console.log('Acceso permitido, abriendo modal');
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
    if(!this.authservices.isAdmin() && !this.isOrganizador){
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

    this._service.deleteEventoDelPanico(idEvento).subscribe({
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
        this.mensajeError = 'No se pudo eliminar el evento.';
        this.showModalError = true;
      }
    });
  }

  confirmarCancelEvento() {
    if (!this.eventoSeleccionado || this.eventoSeleccionado.fechaEvento < this.now) return;
    
    const idEvento = this.eventoSeleccionado.idEvento;

    this._service.deleteEventoDelPanico(idEvento).subscribe({
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

  // ===================================
  // FUNCIONALIDAD DE SORTEO DE CAPITANES
  // ===================================

  /**
   * Cargar capitanes del usuario actual
   */
  async cargarCapitanesDelUsuario(): Promise<void> {
    const userId = this.authservices.currentUser()?.idUsuario;
    if (!userId) return;

    try {
      const capitanes = await firstValueFrom(
        this.capitanActividadService.getCapitanActividadByIdUsuarioCapitan(userId).pipe(
          catchError(() => of([]))
        )
      );
      this.capitanesDelUsuario.set(Array.isArray(capitanes) ? capitanes : [capitanes]);
    } catch (error) {
      console.error('Error cargando capitanes del usuario:', error);
      this.capitanesDelUsuario.set([]);
    }
  }

  /**
   * Verificar si el usuario es capitán de una actividad específica
   */
  esCapitanDeEstaActividad(idEventoActividad: number): boolean {
    return this.actividadesDondeEsCapitan().includes(idEventoActividad);
  }

  /**
   * Verificar si el evento está a 1 semana o menos de comenzar
   */
  estaAUnaSemanaDelEvento(fechaEvento: string): boolean {
    const ahora = new Date();
    const fecha = new Date(fechaEvento);
    const diferenciaDias = Math.floor((fecha.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
    return diferenciaDias <= 7 && diferenciaDias >= 0;
  }

  /**
   * Realizar sorteo de capitanes para un evento específico
   * Se ejecuta para todas las actividades del evento que aún no tienen capitán
   */
  async realizarSorteoCapitanes(idEvento: number): Promise<void> {
    if (this.sorteoEnProgreso() || (!this.authservices.isAdmin() && !this.isOrganizador)) {

      return;
    }
    this.sorteoEnProgreso.set(true);

    try {
      // 1. Obtener todas las actividades del evento
      const actividades = await firstValueFrom(
        this.actividadesService.getActividadesByIdEnvento(idEvento)
      );

      if (!actividades || actividades.length === 0) {
     
        return;
      }

      this.actividadesDelEvento.set(actividades);
      let capitanesAsignados = 0;
      let actividadesSinCandidatos = 0;
      let actividadesConCapitan = 0;

      // 2. Para cada actividad, verificar si ya tiene capitán y hacer sorteo
      for (const actividad of actividades) {
        try {
          // Verificar si ya tiene capitán
          const capitanExistente = await firstValueFrom(
            this.capitanActividadService.getCapitanActividadByIdEventoActividad(actividad.idEventoActividad).pipe(
              map(result => result ? result : null),
              catchError(() => of(null))
            )
          );

          if (capitanExistente) {
          
            actividadesConCapitan++;
            continue;
          }

          // Obtener inscripciones que quieren ser capitán para esta actividad específica
          const candidatos = await firstValueFrom(
            this.inscripcionesService.getIncripcionesUsuariosEventoCapitanActividad(
              idEvento,
              actividad.idActividad
            ).pipe(
              catchError(() => of([]))
            )
          );

          if (!candidatos || candidatos.length === 0) {
       
            actividadesSinCandidatos++;
            continue;
          }

          // Random entre candidatos
          const randomIndex = Math.floor(Math.random() * candidatos.length);
          const capitanSeleccionado = candidatos[randomIndex];

          // Crear registro de capitán
          const nuevoCapitan: CapitanActividad = {
            idCapitanActividad: 0,
            idEventoActividad: actividad.idEventoActividad,
            idUsuario: capitanSeleccionado.idUsuario
          };

          await firstValueFrom(
            this.capitanActividadService.createCapitanActividad(nuevoCapitan)
          );
 
          capitanesAsignados++;

        } catch (error) {
          console.error(`Error procesando actividad ${actividad.idActividad}:`, error);
        }
      }

      // 3. Recargar capitanes del usuario actual
      await this.cargarCapitanesDelUsuario();

      // 4. Mostrar resumen
      let mensaje = `Sorteo completado:\n\n`;
      mensaje += `✅ Capitanes asignados: ${capitanesAsignados}\n`;
      if (actividadesConCapitan > 0) {
        mensaje += `ℹ Actividades que ya tenían capitán: ${actividadesConCapitan}\n`;
      }
      if (actividadesSinCandidatos > 0) {
        mensaje += `⚠ Actividades sin candidatos: ${actividadesSinCandidatos}\n`;
      }

   

    } catch (error) {
      console.error('❌ Error en sorteo de capitanes:', error);
     
    } finally {
      this.sorteoEnProgreso.set(false);
    }
  }

  /**
   * Verificar y ejecutar sorteo automático si el evento está a 1 semana o menos
   */
  verificarYEjecutarSorteoAutomatico(evento: evento): void {
    if (!this.authservices.isAdmin() && !this.isOrganizador) return;
    
    if (this.estaAUnaSemanaDelEvento(evento.fechaEvento)) {
      const confirmar = confirm(
        `El evento "${evento.fechaEvento}" está a menos de una semana.\n\n` +
        '¿Deseas realizar el sorteo de capitanes ahora?'
      );
      
      if (confirmar) {
        this.realizarSorteoCapitanes(evento.idEvento);
      }
    }
  }
}
