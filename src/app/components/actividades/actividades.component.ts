import { Component, inject, Input, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { ActividadesService } from '../../services/actividades.service';
import { ActividadesResponse, ActividadEventoResponse } from '../../interface/actividades.interface';
import { ActividadEvento, ActividadEventoCreate } from '../../interface/actividadEvento.interface';
import { tap, switchMap, forkJoin } from 'rxjs';
import { InscripcionesService } from '../../services/inscripciones.service';
import { A } from '@angular/cdk/keycodes';
import { AuthService } from '../../auth/services/auth.service';
import { InscripcionesResponse } from '../../interface/inscripciones.interface';
import { UsuarioDeporteService } from '../../services/usuarioDeporte.service';
import { UsuarioDeporteResponse } from '../../interface/usuariodeporte.interface';
import { Router } from '@angular/router';
import { ActividadEventoService } from '../../services/actividadEvento.service';
import { ServiceEventos } from '../../services/evento.service';
import { evento } from '../../models/evento';


@Component({
  selector: 'app-actividades',
  standalone: false,
  templateUrl: './actividades.component.html',
  styleUrl: './actividades.component.css',
})
export class ActividadesComponent implements OnInit,OnChanges {


  
  private actividadesService=inject(ActividadesService);
  private inscripcionService=inject(InscripcionesService);
  public authService=inject(AuthService);
  private usuariodeporteService=inject(UsuarioDeporteService);
  private actividadEventoService=inject(ActividadEventoService);
  private eventosService=inject(ServiceEventos);
  public actividades=signal<(ActividadEventoResponse & { estaInscrito: UsuarioDeporteResponse[] })[]>([]);
  public actividadEvento=signal<ActividadEventoResponse[] | []>([]);
  

  public showModal = signal<boolean>(false);
  public quiereSerCapitan = signal<boolean>(false);
  private actividadSeleccionada = signal<{idEventoActividad: number} | null>(null);

  public showModalDesapuntar = signal<boolean>(false);
  private inscripcionSeleccionada = signal<{idInscripcion: number, idEventoActividad: number} | null>(null);

  // Modal Crear Actividad
  public showModalCrearActividad = signal<boolean>(false);
  public tabActivo = signal<'existente' | 'copiar' | 'nueva'>('existente');
  public actividadesBase = signal<ActividadesResponse[]>([]);
  public eventosDisponibles = signal<evento[]>([]);
  public actividadesDeEvento = signal<ActividadEventoResponse[]>([]);
  public eventoSeleccionadoParaCopiar = signal<number | null>(null);
  public actividadesSeleccionadasParaCopiar = signal<number[]>([]);
  
  // Formulario crear actividad
  public actividadSeleccionadaId = signal<number | null>(null);
  public posicionNueva = signal<number>(1);
  public profesorIdNuevo = signal<number>(1);
  
  // Formulario nueva actividad desde cero
  public nombreNuevaActividad = signal<string>('');
  public minimoJugadoresNueva = signal<number>(2);

  // Computed para detectar si es actividad de equipo
  esActividadConMinJugadores(): boolean {
    const nombre = this.nombreNuevaActividad().toLowerCase();
    return nombre.includes('futbol') || nombre.includes('fútbol') || 
           nombre.includes('baloncesto') || nombre.includes('basket');
  }

  // Validación para crear nueva actividad
  puedeCrearNuevaActividad(): boolean {
    const nombre = this.nombreNuevaActividad().trim();
    if (!nombre) return false;
    
    // Si es actividad de equipo, el mínimo jugadores es obligatorio y debe ser > 0
    if (this.esActividadConMinJugadores()) {
      const minJugadores = this.minimoJugadoresNueva();
      return minJugadores != null && minJugadores > 0;
    }
    
    return true;
  }

  // Modal Editar Actividad
  public showModalEditar = signal<boolean>(false);
  public actividadParaEditar = signal<ActividadEventoResponse | null>(null);
  public posicionEditar = signal<number>(1);
  public profesorIdEditar = signal<number>(1);

  constructor(private _router: Router){}
   
  
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
  
  showDetails(actividad: number) {
    console.log("Ver detalles de:", actividad);
   
  }

  // ========== MODAL CREAR ACTIVIDAD ==========
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
      // Filtrar para no mostrar el evento actual
      const otrosEventos = eventos.filter(e => e.idEvento !== this.idEvento);
      this.eventosDisponibles.set(otrosEventos);
    });
  }

  onEventoSeleccionadoChange(eventoId: number) {
    this.eventoSeleccionadoParaCopiar.set(eventoId);
    this.actividadesSeleccionadasParaCopiar.set([]); // Reset la selección
    if (eventoId) {
      this.actividadesService.getActividadesByIdEnvento(eventoId).subscribe(actividades => {
        this.actividadesDeEvento.set(actividades);
      });
    } else {
      this.actividadesDeEvento.set([]);
    }
  }

  // Crear actividad desde existente
  confirmarCrearDesdeExistente() {
    const actividadId = this.actividadSeleccionadaId();
    if (!actividadId) return;

    const nuevaActividadEvento: ActividadEventoCreate = {
      idEvento: this.idEvento,
      idActividad: actividadId
    };

    console.log('Enviando ActividadEvento:', nuevaActividadEvento);

    this.actividadEventoService.createActividadEvento(nuevaActividadEvento).subscribe({
      next: () => {
        this.cerrarModalCrearActividad();
        this.getActividadesByIdEnvento(this.idEvento);
      },
      error: (err) => {
        console.error('Error al crear actividad:', err);
        alert('Error al crear la actividad. Revisa la consola.');
      }
    });
  }

  // Copiar actividades de otro evento usando el select múltiple
  confirmarCopiarActividad() {
    const idsActividades = this.actividadesSeleccionadasParaCopiar();
    if (idsActividades.length === 0) return;

    // Crear todas las peticiones
    const peticiones = idsActividades.map(idActividad => {
      const nuevaActividadEvento: ActividadEventoCreate = {
        idEvento: this.idEvento,
        idActividad: idActividad
      };
      console.log('Copiando ActividadEvento:', nuevaActividadEvento);
      return this.actividadEventoService.createActividadEvento(nuevaActividadEvento);
    });

    // Ejecutar todas en paralelo
    forkJoin(peticiones).subscribe({
      next: () => {
        this.cerrarModalCrearActividad();
        this.getActividadesByIdEnvento(this.idEvento);
      },
      error: (err) => {
        console.error('Error al copiar actividades:', err);
        alert('Error al copiar las actividades. Revisa la consola.');
      }
    });
  }

  // Copiar actividad de otro evento (método legacy con botones mini)
  copiarActividadDeOtroEvento(actividad: ActividadEventoResponse) {
    const nuevaActividadEvento: ActividadEventoCreate = {
      idEvento: this.idEvento,
      idActividad: actividad.idActividad
    };

    console.log('Copiando ActividadEvento:', nuevaActividadEvento);

    this.actividadEventoService.createActividadEvento(nuevaActividadEvento).subscribe({
      next: () => {
        this.cerrarModalCrearActividad();
        this.getActividadesByIdEnvento(this.idEvento);
      },
      error: (err) => {
        console.error('Error al copiar actividad:', err);
        alert('Error al copiar la actividad. Revisa la consola.');
      }
    });
  }

  // Crear actividad completamente nueva
  confirmarCrearNueva() {
    const nombre = this.nombreNuevaActividad();
    const minJugadores = this.minimoJugadoresNueva();
    
    if (!nombre.trim()) return;

    // Primero crear la actividad base
    const nuevaActividad: ActividadesResponse = {
      idActividad: 0,
      nombre: nombre,
      minimoJugadores: minJugadores
    };

    console.log('Creando actividad base:', nuevaActividad);

    // Usar switchMap para encadenar las peticiones (inner join de observables)
    this.actividadesService.createActividades(nuevaActividad).pipe(
      switchMap((actividadCreada) => {
        console.log('Actividad base creada:', actividadCreada);
        const nuevaActividadEvento: ActividadEventoCreate = {
          idEvento: this.idEvento,
          idActividad: actividadCreada.idActividad
        };
        console.log('Asociando al evento:', nuevaActividadEvento);
        return this.actividadEventoService.createActividadEvento(nuevaActividadEvento);
      })
    ).subscribe({
      next: () => {
        console.log('Actividad asociada al evento correctamente');
        this.cerrarModalCrearActividad();
        this.getActividadesByIdEnvento(this.idEvento);
      },
      error: (err) => {
        console.error('Error en el proceso:', err);
        alert('Error al crear la actividad. Revisa la consola.');
        // Aún así cerramos y recargamos por si la primera parte funcionó
        this.cerrarModalCrearActividad();
        this.getActividadesByIdEnvento(this.idEvento);
      }
    });
  }

  // ========== MODAL EDITAR ACTIVIDAD ==========
  abrirModalEditar(actividad: ActividadEventoResponse) {
    this.actividadParaEditar.set(actividad);
    this.posicionEditar.set(actividad.posicion);
    this.profesorIdEditar.set(actividad.idProfesor);
    this.showModalEditar.set(true);
  }

  cerrarModalEditar() {
    this.showModalEditar.set(false);
    this.actividadParaEditar.set(null);
  }

  confirmarEditar() {
    const actividad = this.actividadParaEditar();
    if (!actividad) return;

    const actividadActualizada: ActividadEvento = {
      idEventoActividad: actividad.idEventoActividad,
      idEvento: actividad.idEvento,
      idActividad: actividad.idActividad
    };

    this.actividadEventoService.updateActividadEvento(actividadActualizada).subscribe({
      next: () => {
        this.cerrarModalEditar();
        this.getActividadesByIdEnvento(this.idEvento);
      },
      error: (err) => console.error('Error al actualizar actividad:', err)
    });
  }

  eliminarActividadDelEvento() {
    const actividad = this.actividadParaEditar();
    if (!actividad) return;

    if (confirm('¿Estás seguro de que quieres eliminar esta actividad del evento?')) {
      this.actividadEventoService.deleteActividadEvento(actividad.idEventoActividad).subscribe({
        next: () => {
          this.cerrarModalEditar();
          this.getActividadesByIdEnvento(this.idEvento);
        },
        error: (err) => console.error('Error al eliminar actividad:', err)
      });
    }
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
}
