import { Component, inject, Input, OnInit, OnChanges, SimpleChanges, signal, computed, effect } from '@angular/core';
import { ActividadesService } from '../../services/actividades.service';
import { ActividadesResponse, ActividadEventoResponse } from '../../interface/actividades.interface';
import { ActividadEvento, ActividadEventoCreate } from '../../interface/actividadEvento.interface';
import { tap, switchMap, forkJoin, of, EMPTY, firstValueFrom, catchError, map } from 'rxjs';
import { InscripcionesService } from '../../services/inscripciones.service';
import { A } from '@angular/cdk/keycodes';
import { AuthService } from '../../auth/services/auth.service';
import ServicePerfil from '../../services/perfil.service';
import { InscripcionesResponse } from '../../interface/inscripciones.interface';
import { UsuarioDeporteService } from '../../services/usuarioDeporte.service';
import { UsuarioDeporteResponse } from '../../interface/usuariodeporte.interface';
import { Router } from '@angular/router';
import { ActividadEventoService } from '../../services/actividadEvento.service';
import { ServiceEventos } from '../../services/evento.service';
import { evento } from '../../models/evento';
import { EquipoService } from '../../services/equipo.service';
import { MiembroEquiposService } from '../../services/miembroEquipos.service';
import { CapitanActividadService } from '../../services/capitanActividad.service';
import { CapitanActividad } from '../../interface/capitanActividad.interface';
import ServiceOrganizadores from '../../services/organizadores.service';


@Component({
  selector: 'app-actividades',
  standalone: false,
  templateUrl: './actividades.component.html',
  styleUrl: './actividades.component.css',
})
export class ActividadesComponent implements OnInit,OnChanges {


  public organizadorService=inject(ServiceOrganizadores);
 public isOrganizador: boolean = false;
  private actividadesService=inject(ActividadesService);
  private inscripcionService=inject(InscripcionesService);
  public authService=inject(AuthService);
  private usuariodeporteService=inject(UsuarioDeporteService);
  private actividadEventoService=inject(ActividadEventoService);
  private eventosService=inject(ServiceEventos);
  private equipoService=inject(EquipoService);
  private miembroEquiposService=inject(MiembroEquiposService);
  private capitanActividadService=inject(CapitanActividadService);
  private perfilService=inject(ServicePerfil);
  
  public actividades=signal<(ActividadEventoResponse & { estaInscrito: UsuarioDeporteResponse[] })[]>([]);
  public actividadEvento=signal<ActividadEventoResponse[] | []>([]);
  public showModal = signal<boolean>(false);
  public quiereSerCapitan = signal<boolean>(false);
  public actividadSeleccionada = signal<{idEventoActividad: number} | null>(null);
  public showModalDesapuntar = signal<boolean>(false);
  private inscripcionSeleccionada = signal<{idInscripcion: number, idEventoActividad: number} | null>(null);
  
  // Señales para sorteo de capitán
  public sorteoEnProgreso = signal<boolean>(false);
  public showModalSorteoCapitan = signal<boolean>(false);
  public candidatosCapitan = signal<any[]>([]);
  public actividadParaSorteo = signal<{idEventoActividad: number, idActividad: number, nombreActividad: string} | null>(null);
  public capitanSeleccionado = signal<any | null>(null);
  public capitanActual = signal<any | null>(null); // Capitán existente en modo edición
  public modoEdicionCapitan = signal<boolean>(false); // Si es edición o nuevo sorteo
  public showModalExito = signal<boolean>(false); // Modal de éxito
  public mensajeExito = signal<string>(''); // Mensaje del modal de éxito

  public showModalCrearActividad = signal<boolean>(false);
  public tabActivo = signal<'existente' | 'copiar' | 'nueva'>('existente');
  public actividadesBase = signal<ActividadesResponse[]>([]);
  public eventosDisponibles = signal<evento[]>([]);
  public actividadesDeEvento = signal<ActividadEventoResponse[]>([]);
  public eventoSeleccionadoParaCopiar = signal<number | null>(null);
  public actividadesSeleccionadasParaCopiar = signal<number[]>([]);
  

  public actividadSeleccionadaId = signal<number | null>(null);
  public posicionNueva = signal<number>(1);
  public profesorIdNuevo = signal<number>(1);
  
  public nombreNuevaActividad = signal<string>('');
  public minimoJugadoresNueva = signal<number>(2);

 
  esActividadConMinJugadores(): boolean {
    const nombre = this.nombreNuevaActividad().toLowerCase();
    return nombre.includes('futbol') || nombre.includes('fútbol') || 
           nombre.includes('baloncesto') || nombre.includes('basket');
  }

 
  puedeCrearNuevaActividad(): boolean {
    const nombre = this.nombreNuevaActividad().trim();
    if (!nombre) return false;
    if (this.esActividadConMinJugadores()) {
      const minJugadores = this.minimoJugadoresNueva();
      return minJugadores != null && minJugadores > 0;
    }
    
    return true;
  }
  public perfil = computed(() => this.authService.currentUser());
  // Modal Editar Actividad
  public showModalEditar = signal<boolean>(false);
  public actividadParaEditar = signal<ActividadEventoResponse | null>(null);
  public posicionEditar = signal<number>(1);
  public profesorIdEditar = signal<number>(1);
  public nombreEditar = signal<string>('');
  public minimoJugadoresEditar = signal<number>(2);

  // Modal Eliminar Actividad
  public showModalEliminar = signal<boolean>(false);
  
  // Modal Error
  public showModalError = signal<boolean>(false);
  public mensajeError = signal<string>('');

  private organizadorVerificado = false;

  constructor(private _router: Router){
    effect(() => {
      const userId = this.perfil()?.idUsuario;
      if (userId && !this.organizadorVerificado) {
        this.organizadorVerificado = true;
        this.verificarSiEsOrganizador();
      }
    });
  }
   
  
  @Input() idEvento!:number;
  
 ngOnChanges(changes: SimpleChanges): void {
        if (changes['idEvento'] && !changes['idEvento'].isFirstChange()) {
          const val = changes['idEvento'].currentValue as number;
          if (val != null) this.getActividadesByIdEnvento(val);
        }
     }

  ngOnInit(): void {
      this.getActividadesByIdEnvento(this.idEvento);
      
}
 

 
    verificarSiEsOrganizador(): void {
    if (!this.perfil()?.idUsuario) {
      return;
    }
    this.organizadorService.isOrganizador(this.perfil()?.idUsuario!)
      .subscribe({
        next: (isOrganizador) => {
          this.isOrganizador = isOrganizador;
        },
        error: (error) => {
          console.error('Error al verificar si es organizador:', error);
          this.isOrganizador = false;
        }
      }); 
  }
  getActividades(){
    this.actividadesService.getActividades().subscribe();
  }

  getActividadesById(id:number){
    this.actividadesService.getActividadesById(id).subscribe();
  }


  getActividadesByIdEnvento(id:number){
    this.actividadesService.getActividadesByIdEnvento(this.idEvento)
    .pipe(
      
      tap(actividades =>{
        
        this.usuariodeporteService.getActividadesDeUsuario().subscribe(usuarioDeporteActivities => {
          const actividadesConInscripcion = actividades.map(actividad => {
            const estaInscrito = usuarioDeporteActivities.filter(ud => ud.idEventoActividad === actividad.idEventoActividad);
            return { ...actividad, estaInscrito };
          });
          this.actividades.set(actividadesConInscripcion);
        });
        

      })
    )
    .subscribe();
  }

   abrirModalUnirse(idEventoActividad: number) {
    this.actividadSeleccionada.set({ idEventoActividad });
    this.quiereSerCapitan.set(false);
    this.showModal.set(true);
  }

  cerrarModal() {
    this.showModal.set(false);
    this.actividadSeleccionada.set(null);
    this.quiereSerCapitan.set(false);
  }

  confirmarInscripcion() {
    const actividad = this.actividadSeleccionada();
    if (!actividad) return;

    const inscripcion: InscripcionesResponse = {
     
      idUsuario: this.authService.currentUser()?.idUsuario!,
      idEventoActividad: actividad.idEventoActividad,
      quiereSerCapitan: this.quiereSerCapitan(),
      fechaInscripcion: new Date()
    };
    
    this.inscripcionService.createInscripcion(inscripcion).subscribe({
      next: () => {
        this.cerrarModal();
          this.getActividadesByIdEnvento(this.idEvento);
      },
      error: () => {
        this.cerrarModal();
      }
    });
  }
 abrirModalDesapuntar(idEventoActividad: number) {
 
      const actividad = this.actividades().find(act => act.idEventoActividad === idEventoActividad);
      if (actividad && actividad.estaInscrito.length > 0) {
      
        this.inscripcionService.getInscripciones().subscribe((todas: any) => {
          const usuario = this.authService.currentUser();
          const inscripcion = (todas as any[]).find((i) => i.idUsuario === usuario?.idUsuario && i.idEventoActividad === idEventoActividad);
          if (inscripcion && inscripcion.idInscripcion) {
            this.inscripcionSeleccionada.set({
              idInscripcion: inscripcion.idInscripcion,
              idEventoActividad: idEventoActividad
            });
            this.showModalDesapuntar.set(true);
          }
        });
      }
    }

    cerrarModalDesapuntar() {
      this.showModalDesapuntar.set(false);
      this.inscripcionSeleccionada.set(null);
    }

    confirmarDesapuntar() {
      const inscripcion = this.inscripcionSeleccionada();
      if (!inscripcion) return;
      this.inscripcionService.deleteInscripcionById(inscripcion.idInscripcion).subscribe({
        next: () => {
          this.cerrarModalDesapuntar();
          this.getActividadesByIdEnvento(this.idEvento);
        },
        error: () => {
          this.cerrarModalDesapuntar();
        }
      });
    }

  toggleCapitan() {
    this.quiereSerCapitan.set(!this.quiereSerCapitan());
  }
  


  abrirModalCrearActividad() {
    this.showModalCrearActividad.set(true);
    this.tabActivo.set('existente');
    this.cargarActividadesBase();
    this.cargarEventosDisponibles();
  }

  cerrarModalCrearActividad() {
    this.showModalCrearActividad.set(false);
    this.resetFormularioCrear();
  }

  resetFormularioCrear() {
    this.actividadSeleccionadaId.set(null);
    this.posicionNueva.set(1);
    this.profesorIdNuevo.set(1);
    this.nombreNuevaActividad.set('');
    this.minimoJugadoresNueva.set(2);
    this.eventoSeleccionadoParaCopiar.set(null);
    this.actividadesDeEvento.set([]);
    this.actividadesSeleccionadasParaCopiar.set([]);
  }

  cambiarTab(tab: 'existente' | 'copiar' | 'nueva') {
    this.tabActivo.set(tab);
  }

  cargarActividadesBase() {
    this.actividadesService.getActividades().subscribe(actividades => {
      this.actividadesBase.set(actividades);
    });
  }

  cargarEventosDisponibles() {
    this.eventosService.getEventosCursoEscolar().subscribe(eventos => {
     
      const otrosEventos = eventos.filter(e => e.idEvento !== this.idEvento);
      this.eventosDisponibles.set(otrosEventos);
    });
  }

  onEventoSeleccionadoChange(eventoId: number) {
    this.eventoSeleccionadoParaCopiar.set(eventoId);
    this.actividadesSeleccionadasParaCopiar.set([]);
    if (eventoId) {
      this.actividadesService.getActividadesByIdEnvento(eventoId).subscribe(actividades => {
        this.actividadesDeEvento.set(actividades);
      });
    } else {
      this.actividadesDeEvento.set([]);
    }
  }


  confirmarCrearDesdeExistente() {
    const actividadId = this.actividadSeleccionadaId();
    if (!actividadId) return;

    // Obtener el nombre de la actividad seleccionada
    const actividadSeleccionada = this.actividadesBase().find(a => a.idActividad === actividadId);
    if (!actividadSeleccionada) return;

    // Validar que no exista ya en el evento
    if (this.existeActividadConNombre(actividadSeleccionada.nombre)) {
      this.mensajeError.set(`La actividad "${actividadSeleccionada.nombre}" ya existe en este evento.`);
      this.showModalError.set(true);
      return;
    }

    const nuevaActividadEvento: ActividadEventoCreate = {
      idEvento: this.idEvento,
      idActividad: actividadId
    };

    

    this.actividadEventoService.createActividadEvento(nuevaActividadEvento).subscribe({
      next: () => {
        this.cerrarModalCrearActividad();
        this.getActividadesByIdEnvento(this.idEvento);
      },
      error: (err) => {
        console.error('Error al crear actividad:', err);
  
      }
    });
  }


  confirmarCopiarActividad() {
    const idsActividades = this.actividadesSeleccionadasParaCopiar();
    if (idsActividades.length === 0) return;

    // Validar que ninguna actividad exista ya en el evento
    const actividadesDeEvento = this.actividadesDeEvento();
    const duplicadas: string[] = [];
    
    idsActividades.forEach(idActividad => {
      const actividad = actividadesDeEvento.find(a => a.idActividad === idActividad);
      if (actividad && this.existeActividadConNombre(actividad.nombreActividad)) {
        duplicadas.push(actividad.nombreActividad);
      }
    });

    if (duplicadas.length > 0) {
      this.mensajeError.set(
        `Las siguientes actividades ya existen en este evento:\n${duplicadas.join(', ')}`
      );
      this.showModalError.set(true);
      return;
    }

    const peticiones = idsActividades.map(idActividad => {
      const nuevaActividadEvento: ActividadEventoCreate = {
        idEvento: this.idEvento,
        idActividad: idActividad
      };
   
      return this.actividadEventoService.createActividadEvento(nuevaActividadEvento);
    });

    forkJoin(peticiones).subscribe({
      next: () => {
        this.cerrarModalCrearActividad();
        this.getActividadesByIdEnvento(this.idEvento);
      },
      error: (err) => {
        console.error('Error al copiar actividades:', err);
  
      }
    });
  }


  copiarActividadDeOtroEvento(actividad: ActividadEventoResponse) {
    const nuevaActividadEvento: ActividadEventoCreate = {
      idEvento: this.idEvento,
      idActividad: actividad.idActividad
    };


    this.actividadEventoService.createActividadEvento(nuevaActividadEvento).subscribe({
      next: () => {
        this.cerrarModalCrearActividad();
        this.getActividadesByIdEnvento(this.idEvento);
      },
      error: (err) => {
        console.error('Error al copiar actividad:', err);

      }
    });
  }


  confirmarCrearNueva() {
    const nombre = this.nombreNuevaActividad();
    const minJugadores = this.minimoJugadoresNueva();
    
    if (!nombre.trim()) return;

    // Validar que no exista ya en el evento
    if (this.existeActividadConNombre(nombre)) {
      this.mensajeError.set(`La actividad "${nombre}" ya existe en este evento.`);
      this.showModalError.set(true);
      return;
    }

    const nuevaActividad: ActividadesResponse = {
      idActividad: 0,
      nombre: nombre,
      minimoJugadores: minJugadores
    };


    this.actividadesService.createActividades(nuevaActividad).pipe(
      switchMap((actividadCreada) => {
       
        const nuevaActividadEvento: ActividadEventoCreate = {
          idEvento: this.idEvento,
          idActividad: actividadCreada.idActividad
        };
      
        return this.actividadEventoService.createActividadEvento(nuevaActividadEvento);
      })
    ).subscribe({
      next: () => {
      
        this.cerrarModalCrearActividad();
        this.getActividadesByIdEnvento(this.idEvento);
      },
      error: (err) => {
       
        this.cerrarModalCrearActividad();
        this.getActividadesByIdEnvento(this.idEvento);
      }
    });
  }

 
  abrirModalEditar(actividad: ActividadEventoResponse) {
    const userId = this.authService.currentUser()?.idUsuario;
    if (userId) {
      this.procesarEdicionActividad(userId, actividad);
      return;
    }

    console.log('currentUser es null, cargando perfil...');
    this.authService.ensureUserProfile()
      .then((perfil) => {
        console.log('ensureUserProfile devolvió:', perfil);
        if (!perfil) {
          console.error('ensureUserProfile devolvió null');
          return;
        }
        const perfilId = perfil.idUsuario;
        if (perfilId === undefined || perfilId === null) {
          console.error('Perfil sin idUsuario:', perfil);
          return;
        }
        console.log('Usuario cargado, idUsuario:', perfilId);
        this.procesarEdicionActividad(perfilId, actividad);
      })
      .catch((error) => {
        console.error('Error al cargar perfil para editar:', error);
      });
  }

  private procesarEdicionActividad(userId: number, actividad: ActividadEventoResponse) {
    if (this.isOrganizador || this.authService.isAdmin()) {
      this.actividadParaEditar.set(actividad);
      this.posicionEditar.set(actividad.posicion);
      this.profesorIdEditar.set(actividad.idProfesor);
      this.nombreEditar.set(actividad.nombreActividad);
      this.minimoJugadoresEditar.set(actividad.minimoJugadores || 2);
      this.showModalEditar.set(true);
      return;
    }

    // Si no es organizador, verificar si es capitán
    this.capitanActividadService.isCapitan(userId, actividad.idEventoActividad)
      .subscribe({
        next: (esCapitan) => {
          if (esCapitan) {
            this.actividadParaEditar.set(actividad);
            this.posicionEditar.set(actividad.posicion);
            this.profesorIdEditar.set(actividad.idProfesor);
            this.nombreEditar.set(actividad.nombreActividad);
            this.minimoJugadoresEditar.set(actividad.minimoJugadores || 2);
            this.showModalEditar.set(true);
          } else {
            alert('No tienes permisos para editar esta actividad. Solo los capitanes o el organizador pueden hacerlo.');
          }
        },
        error: (error) => {
          console.error('Error al verificar permisos:', error);
          alert('Error al verificar permisos');
        }
      });
  }

  cerrarModalEditar() {
    this.showModalEditar.set(false);
    this.actividadParaEditar.set(null);
  }

  esActividadDeEquipoEditar(): boolean {
    const nombre = this.nombreEditar().toLowerCase();
    return nombre.includes('futbol') || nombre.includes('fútbol') || 
           nombre.includes('baloncesto') || nombre.includes('basket');
  }

  puedeGuardarEdicion(): boolean {
    const nombre = this.nombreEditar().trim();
    if (!nombre) return false;
    
    if (this.esActividadDeEquipoEditar()) {
      const minJugadores = this.minimoJugadoresEditar();
      return minJugadores != null && minJugadores > 0;
    }
    
    return true;
  }

  confirmarEditar() {
    const actividad = this.actividadParaEditar();
    if (!actividad || !this.puedeGuardarEdicion()) return;

    // Validar que no exista otra actividad con el mismo nombre
    if (this.existeActividadConNombre(this.nombreEditar(), actividad.idActividad)) {
      this.mensajeError.set(`Ya existe otra actividad con el nombre "${this.nombreEditar()}" en este evento.`);
      this.showModalError.set(true);
      return;
    }

    // Primero actualizar la actividad base
    const actividadBase: ActividadesResponse = {
      idActividad: actividad.idActividad,
      nombre: this.nombreEditar(),
      minimoJugadores: this.minimoJugadoresEditar()
    };

    this.actividadesService.updateActividades(actividadBase).subscribe({
      next: () => {
        this.cerrarModalEditar();
        this.getActividadesByIdEnvento(this.idEvento);
      },
      error: (err) => console.error('Error al actualizar actividad:', err)
    });
  }

  eliminarActividadDelEvento() {
    this.showModalEliminar.set(true);
  }

  cerrarModalEliminar() {
    this.showModalEliminar.set(false);
  }

  cerrarModalError() {
    this.showModalError.set(false);
    this.mensajeError.set('');
  }

  confirmarEliminar() {
    const actividad = this.actividadParaEditar();
    if (!actividad) return;


    this.actividadEventoService.deleteActividadDelPanico(actividad.idEventoActividad).subscribe({
           next: () => {
            this.cerrarModalEliminar();
            this.cerrarModalEditar();
             this.getActividadesByIdEnvento(this.idEvento);
          },
          error: (err) => this.manejarErrorEliminacion(err)
       });

  }

  esActividadDeEquipo(nombreActividad: string): boolean {
    const nombre = nombreActividad.toLowerCase();
    return nombre.includes('futbol') || nombre.includes('fútbol') || 
           nombre.includes('baloncesto') || nombre.includes('basket');
  }

  normalizarNombreActividad(nombre: string): string {
    let normalizado = nombre.toLowerCase().trim();
    
    // Normalizar sinónimos de fútbol
    if (normalizado.includes('futbol') || normalizado.includes('fútbol')) {
      normalizado = 'futbol';
    }
    
    // Normalizar sinónimos de baloncesto
    if (normalizado.includes('basket') || normalizado.includes('baloncesto')) {
      normalizado = 'baloncesto';
    }
    
    // Quitar acentos
    normalizado = normalizado.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    return normalizado;
  }

  existeActividadConNombre(nombre: string, idActividadExcluir?: number): boolean {
    const nombreNormalizado = this.normalizarNombreActividad(nombre);
    
    return this.actividades().some(act => {
     
      if (idActividadExcluir && act.idActividad === idActividadExcluir) {
        return false;
      }
      
      const nombreActividadNormalizado = this.normalizarNombreActividad(act.nombreActividad);
      return nombreActividadNormalizado === nombreNormalizado;
    });
  }

  manejarErrorEliminacion(err: any) {
 
    this.cerrarModalEliminar();
    
    let mensaje = 'No se pudo eliminar la actividad del evento.\n\n';
    
    if (err.status === 500) {
      mensaje += ' Error del servidor al intentar eliminar.\n\n';
   
    } else if (err.status === 404) {
      mensaje += 'La actividad no existe o ya fue eliminada.';
    } else if (err.status === 403) {
      mensaje += 'No tienes permisos para eliminar esta actividad.';
    } else {
      mensaje += 'Error desconocido del servidor. Intenta de nuevo más tarde.';
    }
    
    this.mensajeError.set(mensaje);
    this.showModalError.set(true);
  }
  
  isFutureEvent(fechaEvento: Date): boolean {
    const eventoDate = new Date(fechaEvento);
    const currentDate = new Date();
    return eventoDate > currentDate;
  }

  estaInscritoEnAlgunaActividad(): boolean {
    return this.actividades().some(act => act.estaInscrito.length > 0);
  }

  
  estaInscritoEnEstaActividad(idEventoActividad: number): boolean {
    const actividad = this.actividades().find(act => act.idEventoActividad === idEventoActividad);
    return actividad ? actividad.estaInscrito.length > 0 : false;
  }

  
  createActividades(actividades:ActividadesResponse){

    this.actividadesService.createActividades(actividades).subscribe();
  }

  updateActividades(actividades:ActividadesResponse){
  
    this.actividadesService.updateActividades(actividades).subscribe();
  }

  DeleteActividadesById(id:number){
    this.actividadesService.DeleteActividadesById(id).subscribe();
  }

  verEquipos(idActividad: number, idEvento: number): void {
    this._router.navigate(["/equipos/" + idActividad + "/" + idEvento]);
  }

  /**
   * Abrir modal para sortear capitán (solo para fútbol)
   */
  async abrirModalSorteoCapitan(idEventoActividad?: number, idActividad?: number, nombreActividad?: string): Promise<void> {
    if (!this.authService.isAdmin() && !this.isOrganizador) {
     
      return;
    }

    // Si no se proporciona actividad, buscar la actividad de fútbol del evento actual
    if (!idEventoActividad || idEventoActividad === 0) {
    
      const actividadFutbol = this.actividades().find(a => this.esFutbol(a.nombreActividad));
      
      if (!actividadFutbol) {
      
        return;
      }
      
      idEventoActividad = actividadFutbol.idEventoActividad;
      idActividad = actividadFutbol.idActividad;
      nombreActividad = actividadFutbol.nombreActividad;
    
    }

    this.sorteoEnProgreso.set(true);

    try {
    
      // Obtener todos los capitanes para encontrar el ID del registro
      const todosCapitanes = await firstValueFrom(
        this.capitanActividadService.getCapitanActividad().pipe(
          catchError(() => of([]))
        )
      );
      
      // Buscar el capitán para este idEventoActividad
      const registroCapitan = todosCapitanes.find(c => c.idEventoActividad === idEventoActividad);
      
      if (registroCapitan) {
   
        // Obtener información del usuario capitán
        const infoUsuario = await firstValueFrom(
          this.capitanActividadService.getCapitanActividadByIdEventoActividad(idEventoActividad).pipe(
            catchError(() => of(null))
          )
        );
        
        // Modo edición: mostrar capitán actual
        this.modoEdicionCapitan.set(true);
        this.capitanActual.set(registroCapitan);
        this.capitanSeleccionado.set(infoUsuario || registroCapitan);
        
  
      } else {
      
        this.modoEdicionCapitan.set(false);
        this.capitanActual.set(null);
      }

      
      const candidatos = await firstValueFrom(
        this.inscripcionService.getIncripcionesUsuariosEventoCapitanActividad(this.idEvento, idActividad!).pipe(
          catchError(error => {
            return of([]);
          })
        )
      );



      if (!candidatos || !Array.isArray(candidatos) || candidatos.length === 0) {
      
        this.sorteoEnProgreso.set(false);
      
        return;
      }

      this.actividadParaSorteo.set({ idEventoActividad, idActividad: idActividad!, nombreActividad: nombreActividad! });
      this.candidatosCapitan.set(candidatos);
      if (!this.modoEdicionCapitan()) {
        this.capitanSeleccionado.set(null);
      }
      this.showModalSorteoCapitan.set(true);
     

    } catch (error) {

    } finally {
      this.sorteoEnProgreso.set(false);
    }
  }

  /**
   * Cerrar modal de sorteo
   */
  cerrarModalSorteoCapitan(): void {
    this.showModalSorteoCapitan.set(false);
    this.candidatosCapitan.set([]);
    this.actividadParaSorteo.set(null);
    this.capitanSeleccionado.set(null);
    this.capitanActual.set(null);
    this.modoEdicionCapitan.set(false);
  }

  /**
   * Cerrar modal de éxito
   */
  cerrarModalExito(): void {
    this.showModalExito.set(false);
    this.mensajeExito.set('');
    this.getActividadesByIdEnvento(this.idEvento);
  }

  /**
   * Realizar sorteo random y mostrar resultado
   */
  realizarSorteoRandom(): void {
    const candidatos = this.candidatosCapitan();
    if (candidatos.length === 0) return;

    const randomIndex = Math.floor(Math.random() * candidatos.length);
    const seleccionado = candidatos[randomIndex];
    this.capitanSeleccionado.set(seleccionado);
  }

  /**
   * Confirmar asignación de capitán
   */
  async confirmarAsignacionCapitan(): Promise<void> {
    const capitan = this.capitanSeleccionado();
    const actividad = this.actividadParaSorteo();
    const esEdicion = this.modoEdicionCapitan();

    if (!capitan || !actividad) return;

    this.sorteoEnProgreso.set(true);

    try {
      if (esEdicion) {
        // Eliminar capitán antiguo y crear uno nuevo
        const idCapitanAntiguo = this.capitanActual()?.idCapitanActividad;
        
      
        
        if (idCapitanAntiguo) {
          await firstValueFrom(
            this.capitanActividadService.deleteCapitanActividad(idCapitanAntiguo)
          );
        }
        
        // Crear nuevo capitán
        const nuevoCapitan: CapitanActividad = {
          idCapitanActividad: 0,
          idEventoActividad: actividad.idEventoActividad,
          idUsuario: capitan.idUsuario
        };

        

        await firstValueFrom(
          this.capitanActividadService.createCapitanActividad(nuevoCapitan)
        );

        this.cerrarModalSorteoCapitan();
        this.mensajeExito.set(` ¡Capitán actualizado correctamente!\n\n${capitan.usuario} es el nuevo capitán de ${actividad.nombreActividad}.`);
        this.showModalExito.set(true);

      } else {
        // Crear nuevo capitán
        const nuevoCapitan: CapitanActividad = {
          idCapitanActividad: 0,
          idEventoActividad: actividad.idEventoActividad,
          idUsuario: capitan.idUsuario
        };

        await firstValueFrom(
          this.capitanActividadService.createCapitanActividad(nuevoCapitan)
        );

        this.cerrarModalSorteoCapitan();
        this.mensajeExito.set(` ¡Capitán asignado correctamente!\n\n${capitan.usuario} es el nuevo capitán de ${actividad.nombreActividad}.`);
        this.showModalExito.set(true);
      }

  

    } catch (error) {
    
      this.cerrarModalSorteoCapitan();
    
    } finally {
      this.sorteoEnProgreso.set(false);
    }
  }

  /**
   * Verificar si la actividad es fútbol
   */
  esFutbol(nombreActividad: string): boolean {
    const nombre = nombreActividad.toLowerCase();
    return nombre.includes('futbol') || nombre.includes('fútbol');
  }

  /**
   * Verificar si una actividad específica  es fútbol
   */
  esActividadFutbol(idEventoActividad: number): boolean {
    const actividad = this.actividades().find(a => a.idEventoActividad === idEventoActividad);
    return actividad ? this.esFutbol(actividad.nombreActividad) : false;
  }
}
