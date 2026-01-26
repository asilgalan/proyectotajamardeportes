import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { PartidoResultadoService } from '../../services/partidoResultado.service';
import { PartidoResultado } from '../../interface/partidoResultado.interface';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { EquipoService } from '../../services/equipo.service';
import { ActividadesService } from '../../services/actividades.service';
import { ActividadEventoService } from '../../services/actividadEvento.service';
import { evento } from '../../models/evento';
import { ServiceEventos } from '../../services/evento.service';
import { FormsModule } from "@angular/forms";
import { ActividadEventoResponse } from '../../interface/actividades.interface';
import { CommonModule } from '@angular/common';

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

  public partidoResultados = signal<PartidoResultado[]>([]);
  public eventos = signal<evento[]>([]);
  public actividades = signal<ActividadEventoResponse[]>([]);
  public selectedEventoId = signal<number | null>(null);
  public selectedActividadId = signal<number | null>(null);
  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);
  
  ngOnInit(): void {
    this.loadEventos();
    this.loadAllPartidoResultados();
  }

  private loadEventos(): void {
    this.eventoService.getEventosCursoEscolar()
      .pipe(
        map(eventos => eventos.filter(ev => new Date(ev.fechaEvento) >= new Date())),
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
      this.loadAllPartidoResultados();
      return;
    }

    this.selectedEventoId.set(id);
    this.selectedActividadId.set(null);
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
        
        if (actividades.length > 0) {
          this.loadPartidosByActividad(actividades[0].idEventoActividad);
        } else {
          this.partidoResultados.set([]);
        }
      });
  }

  onActividadChange(actividadId: string): void {
    const id = Number(actividadId);
    
    if (!id) {
      this.selectedActividadId.set(null);
      if (this.selectedEventoId()) {
        this.onEventoChange(this.selectedEventoId()!.toString());
      }
      return;
    }

    this.selectedActividadId.set(id);
    this.loadPartidosByActividad(id);
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
        this.partidoResultados.set(partidosEnriquecidos);
        this.isLoading.set(false);
      });
  }

  resetFilters(): void {
    this.selectedEventoId.set(null);
    this.selectedActividadId.set(null);
    this.actividades.set([]);
    this.loadAllPartidoResultados();
  }
}
