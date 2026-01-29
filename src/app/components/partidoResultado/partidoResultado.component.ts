import { EquipoService } from './../../services/equipo.service';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { PartidoResultadoService } from '../../services/partidoResultado.service';
import { PartidoResultado } from '../../interface/partidoResultado.interface';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';

import { ActividadesService } from '../../services/actividades.service';
import { ActividadEventoService } from '../../services/actividadEvento.service';
import { evento } from '../../models/evento';
import { ServiceEventos } from '../../services/evento.service';
import { FormBuilder, FormsModule } from "@angular/forms";
import { ActividadEventoResponse } from '../../interface/actividades.interface';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';
import { Equipo } from '../../models/equipo';
import { CapitanActividadService } from '../../services/capitanActividad.service';

@Component({
  selector: 'app-partido-resultado',
  imports: [FormsModule, CommonModule],
  templateUrl: './partidoResultado.component.html',
  styleUrl: './partidoResultado.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartidoResultadoComponent implements OnInit { 

  private partidoResultadoService = inject(PartidoResultadoService);
  private equipoService = inject(EquipoService);
  private actividadService = inject(ActividadesService);
  private actividadEventoService = inject(ActividadEventoService);
  private eventoService = inject(ServiceEventos);
  public authService = inject(AuthService);
  public capitanService = inject(CapitanActividadService);
  public isCapitan = signal<boolean>(false);

  public partidoResultados = signal<PartidoResultado[]>([]);
  public eventos = signal<evento[]>([]);
  public actividades = signal<ActividadEventoResponse[]>([]);
  public equipos = signal<any[]>([]);
  public idEventoActividad = signal<number | null>(null);
  public selectedEventoId = signal<number | null>(null);
  public selectedActividadId = signal<number | null>(null);
  public selectedEquipoId = signal<number | null>(null);
  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);
  public modalErrorMessage = signal<string | null>(null);
  private allPartidosCache = signal<PartidoResultado[]>([]);
  
  // Signals para crear resultado
  public showModalCrear = signal<boolean>(false);
  public eventosParaCrear = signal<evento[]>([]);
  public selectedEventoParaCrear = signal<number | null>(null);
  public actividadesParaCrear = signal<ActividadEventoResponse[]>([]);
  public equiposParaCrear = signal<Equipo[]>([]);
  public selectedActividadParaCrear = signal<number | null>(null);
  public selectedEquipoLocal = signal<number | null>(null);
  public selectedEquipoVisitante = signal<number | null>(null);
  public puntosLocal = signal<number>(0);
  public puntosVisitante = signal<number>(0);
  
  // Signals para eliminar resultado
  public showModalEliminar = signal<boolean>(false);
  public resultadoParaEliminar = signal<number | null>(null);
  
  // Signals para editar resultado
  public showModalEditar = signal<boolean>(false);
  public resultadoParaEditar = signal<PartidoResultado | null>(null);
  public puntosLocalEditar = signal<number>(0);
  public puntosVisitanteEditar = signal<number>(0);

  ngOnInit(): void {
    this.loadEventos();
    this.loadAllPartidoResultados();
    this.verificarCapitan();
  }

  abrirModalCrear(): void {
    this.showModalCrear.set(true);
    this.eventoService.getEventosCursoEscolar()
      .pipe(
        catchError(error => {
          console.error('Error cargando eventos:', error);
          return of([]);
        })
      )
      .subscribe(eventos => this.eventosParaCrear.set(eventos));
  }

  cerrarModalCrear(): void {
    this.showModalCrear.set(false);
    this.modalErrorMessage.set(null);
    this.resetFormCrear();
  }

  onEventoParaCrearChange(eventoId: string): void {
    const id = Number(eventoId);
    if (!id) {
      this.selectedEventoParaCrear.set(null);
      this.actividadesParaCrear.set([]);
      this.selectedActividadParaCrear.set(null);
      this.equiposParaCrear.set([]);
      return;
    }

    this.selectedEventoParaCrear.set(id);
    this.selectedActividadParaCrear.set(null);
    this.equiposParaCrear.set([]);
    
    this.actividadService.getActividadesByIdEnvento(id)
      .pipe(
        catchError(error => {
          console.error('Error cargando actividades:', error);
          return of([]);
        })
      )
      .subscribe((actividades: ActividadEventoResponse[]) => {
        this.actividadesParaCrear.set(actividades);
      });
  }

  resetFormCrear(): void {
    this.selectedEventoParaCrear.set(null);
    this.selectedActividadParaCrear.set(null);
    this.equiposParaCrear.set([]);
    this.selectedEquipoLocal.set(null);
    this.selectedEquipoVisitante.set(null);
    this.puntosLocal.set(0);
    this.puntosVisitante.set(0);
  }

  onActividadParaCrearChange(actividadId: string): void {
    const id = Number(actividadId);
    if (!id) {
      this.selectedActividadParaCrear.set(null);
      this.equiposParaCrear.set([]);
      return;
    }

    this.selectedActividadParaCrear.set(id);
    this.selectedEquipoLocal.set(null);
    this.selectedEquipoVisitante.set(null);
    this.modalErrorMessage.set(null);
    
    this.equipoService.getEquipos()
      .pipe(
        map(equipos => equipos.filter(eq => eq.idEventoActividad === id)),
        catchError(error => {
          console.error('Error cargando equipos:', error);
          return of([]);
        })
      )
      .subscribe(equipos => this.equiposParaCrear.set(equipos));
  }

  onEquipoLocalChange(equipoId: string): void {
    const id = Number(equipoId);
    this.selectedEquipoLocal.set(id || null);
    this.validarEquipos();
  }

  onEquipoVisitanteChange(equipoId: string): void {
    const id = Number(equipoId);
    this.selectedEquipoVisitante.set(id || null);
    this.validarEquipos();
  }

  validarEquipos(): void {
    const local = this.selectedEquipoLocal();
    const visitante = this.selectedEquipoVisitante();
    
    if (local && visitante && local === visitante) {
      this.modalErrorMessage.set('Los equipos local y visitante deben ser diferentes');
    } else {
      this.modalErrorMessage.set(null);
    }
  }

  confirmarCrearResultado(): void {
    const idActividad = this.selectedActividadParaCrear();
    const idLocal = this.selectedEquipoLocal();
    const idVisitante = this.selectedEquipoVisitante();
    const ptosLocal = this.puntosLocal();
    const ptosVisitante = this.puntosVisitante();

    if (!idActividad || !idLocal || !idVisitante) {
      this.modalErrorMessage.set('Debes seleccionar actividad y ambos equipos');
      return;
    }

    if (idLocal === idVisitante) {
      this.modalErrorMessage.set('Los equipos local y visitante deben ser diferentes');
      return;
    }

    const nuevoResultado: PartidoResultado = {
      idEventoActividad: idActividad,
      idEquipoLocal: idLocal,
      idEquipoVisitante: idVisitante,
      puntosLocal: ptosLocal,
      puntosVisitante: ptosVisitante
    };

    this.partidoResultadoService.createPartidoResultado(nuevoResultado)
      .pipe(
        catchError(error => {
          console.error('Error creando resultado:', error);
          this.modalErrorMessage.set('Error al crear el resultado');
          return of(null);
        })
      )
      .subscribe(resultado => {
        if (resultado) {
          this.modalErrorMessage.set(null);
          this.cerrarModalCrear();
          this.loadAllPartidoResultados();
        }
      });
  }

  private loadEventos(): void {
    this.eventoService.getEventosCursoEscolar()
      .pipe(
        // por si en un futuro se quiere filtrar por fecha actual
        // map(eventos => eventos.filter(ev => new Date(ev.fechaEvento) >= new Date())),
        catchError(error => {
          console.error('Error cargando eventos:', error);
          this.errorMessage.set('Error al cargar los eventos');
          return of([]);
        })
      )
      .subscribe(eventos => this.eventos.set(eventos));
  }

  private loadAllPartidoResultados(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.partidoResultadoService.getPartidoResultado()
      .pipe(
        switchMap(partidos => this.enrichPartidosWithData(partidos)),
        catchError(error => {
          console.error('Error cargando partidos:', error);
          this.errorMessage.set('Error al cargar los partidos');
          return of([]);
        })
      )
      .subscribe(partidosEnriquecidos => {
        this.partidoResultados.set(partidosEnriquecidos);
        this.isLoading.set(false);
      });
  }

  private enrichPartidosWithData(partidos: PartidoResultado[]) {
    if (partidos.length === 0) return of([]);

    return forkJoin(
      partidos.map(partido => 
        forkJoin({
          equipoLocal: this.equipoService.getEquipoPorId(partido.idEquipoLocal),
          equipoVisitante: this.equipoService.getEquipoPorId(partido.idEquipoVisitante)
        }).pipe(
          switchMap(({ equipoLocal, equipoVisitante }) =>
            this.actividadEventoService.getActividadEventoById(equipoLocal.idEventoActividad).pipe(
              switchMap(actividadEvento =>
                this.actividadService.getActividadesById(actividadEvento.idActividad).pipe(
                  map(actividad => ({
                    ...partido,
                    nombreEquipoLocal: equipoLocal.nombreEquipo,
                    nombreEquipoVisitante: equipoVisitante.nombreEquipo,
                    nombreActividad: actividad.nombre
                  }))
                )
              )
            )
          ),
          catchError(error => {
            console.error('Error enriqueciendo partido:', error);
            return of(partido);
          })
        )
      )
    );
  }

  onEventoChange(eventoId: string): void {
    const id = Number(eventoId);
    
    if (!id) {
      this.selectedEventoId.set(null);
      this.actividades.set([]);
      this.selectedActividadId.set(null);
      this.selectedEquipoId.set(null);
      this.equipos.set([]);
      this.loadAllPartidoResultados();
      return;
    }

    this.selectedEventoId.set(id);
    this.selectedActividadId.set(null);
    this.selectedEquipoId.set(null);
    this.equipos.set([]);
    this.isLoading.set(true);

    this.actividadService.getActividadesByIdEnvento(id)
      .pipe(
        catchError(error => {
          console.error('Error cargando actividades:', error);
          this.errorMessage.set('Error al cargar las actividades');
          return of([]);
        })
      )
      .subscribe(actividades => {
        this.actividades.set(actividades);
        this.isLoading.set(false);
        
    
      });
  }

  onActividadChange(actividadId: string): void {
    const id = Number(actividadId);
    
    if (!id) {
      this.selectedActividadId.set(null);
      this.selectedEquipoId.set(null);
      this.equipos.set([]);
      if (this.selectedEventoId()) {
        this.onEventoChange(this.selectedEventoId()!.toString());
      }
      return;
    }

    this.selectedActividadId.set(id);
    this.loadEquiposByActividad(id);
    this.loadPartidosByActividad(id);
  }

  onEquipoChange(equipoId: string): void {
    const id = Number(equipoId);
    
    if (!id) {
      this.selectedEquipoId.set(null);
      this.partidoResultados.set(this.allPartidosCache());
      return;
    }

    this.selectedEquipoId.set(id);
    this.filterPartidosByEquipo(id);
  }

  private loadEquiposByActividad(idEventoActividad: number): void {
    this.equipoService.getEquipos()
      .pipe(
        map(equipos => equipos.filter(eq => eq.idEventoActividad === idEventoActividad)),
        catchError(error => {
          console.error('Error cargando equipos:', error);
          return of([]);
        })
      )
      .subscribe(equipos => this.equipos.set(equipos));
  }

  private filterPartidosByEquipo(idEquipo: number): void {
    const partidosFiltrados = this.allPartidosCache().filter(partido => 
      partido.idEquipoLocal === idEquipo || partido.idEquipoVisitante === idEquipo
    );
    this.partidoResultados.set(partidosFiltrados);
  }

  private loadPartidosByActividad(idEventoActividad: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.partidoResultadoService.getPartidoResultadoActividadEvento(idEventoActividad)
      .pipe(
        switchMap(partidos => this.enrichPartidosWithData(partidos)),
        catchError(error => {
          console.error('Error cargando partidos por actividad:', error);
          this.errorMessage.set('Error al cargar los partidos');
          return of([]);
        })
      )
      .subscribe(partidosEnriquecidos => {
        this.allPartidosCache.set(partidosEnriquecidos);
        this.partidoResultados.set(partidosEnriquecidos);
        this.isLoading.set(false);
      });
  }


  resetFilters(): void {
    this.selectedEventoId.set(null);
    this.selectedActividadId.set(null);
    this.selectedEquipoId.set(null);
    this.actividades.set([]);
    this.equipos.set([]);
    this.allPartidosCache.set([]);
    this.loadAllPartidoResultados();
  }

  abrirModalEliminar(idPartidoResultado: number): void {
    this.resultadoParaEliminar.set(idPartidoResultado);
    this.showModalEliminar.set(true);
  }

  cerrarModalEliminar(): void {
    this.showModalEliminar.set(false);
    this.resultadoParaEliminar.set(null);
  }

  abrirModalEditar(resultado: PartidoResultado): void {
    this.resultadoParaEditar.set(resultado);
    this.puntosLocalEditar.set(resultado.puntosLocal);
    this.puntosVisitanteEditar.set(resultado.puntosVisitante);
    this.modalErrorMessage.set(null);
    this.showModalEditar.set(true);
  }

  cerrarModalEditar(): void {
    this.showModalEditar.set(false);
    this.resultadoParaEditar.set(null);
    this.puntosLocalEditar.set(0);
    this.puntosVisitanteEditar.set(0);
    this.modalErrorMessage.set(null);

  }

  confirmarEditarResultado(): void {
    const resultado = this.resultadoParaEditar();
    if (!resultado) return;


    const resultadoActualizado: PartidoResultado = {
      idPartidoResultado: resultado.idPartidoResultado,
      idEventoActividad: resultado.idEventoActividad,
      idEquipoLocal: resultado.idEquipoLocal,
      idEquipoVisitante: resultado.idEquipoVisitante,
      puntosLocal: this.puntosLocalEditar(),
      puntosVisitante: this.puntosVisitanteEditar()
    };

    this.partidoResultadoService.updatePartidoResultado(resultadoActualizado)
      .pipe(
        catchError(error => {
          console.error('Error actualizando resultado:', error);
          this.modalErrorMessage.set('Error al actualizar el resultado');
          return of(null);
        })
      )
      .subscribe(resultadoUpdated => {
        console.log('Resultado de la actualización:', resultadoUpdated);
        this.modalErrorMessage.set(null);
        this.cerrarModalEditar();
        this.loadAllPartidoResultados();
      });
  }

  confirmarEliminarResultado(): void {
    const idPartidoResultado = this.resultadoParaEliminar();
    if (!idPartidoResultado) return;

    this.partidoResultadoService.deletePartidoResultado(idPartidoResultado)
      .pipe(
        catchError(error => {
          console.error('Error eliminando resultado:', error);
          this.errorMessage.set('Error al eliminar el resultado');
          return of(null);
        })
      )
      .subscribe(() => {
        const partidosActualizados = this.partidoResultados().filter(pr => pr.idPartidoResultado !== idPartidoResultado);
        this.partidoResultados.set(partidosActualizados);
        this.cerrarModalEliminar();
      });
  }

  verificarCapitan(): void {
    this.capitanService.getCapitanActividadByIdUsuarioCapitan(this.authService.currentUser()?.idUsuario!).subscribe({
      next: (capitanUsuario) => {
        this.isCapitan.set(true);
      },
      error: () => {
        console.log("Error");
      }
    });
  }
}
