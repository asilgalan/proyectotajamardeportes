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
  private allPartidosCache = signal<PartidoResultado[]>([]);
  private fb=inject(FormBuilder);
  public eventosCreate=signal<evento[]>([]);
  public equipocreate=signal<Equipo[]>([]);
  private EquipoService=inject(EquipoService);
  public selectIdEventoCreate=signal<number | null>(null);

  ngOnInit(): void {
    this.loadEventos();
    this.loadAllPartidoResultados();
  }

  loginForm=this.fb.group({
    idEventoActividad:[''],
    idEquipoLocal:[''],
    idEquipoVisitante:[''],
    puntosLocal:[''],
    puntosVisitante:['']
  })

  onSubmit(){
    const {idEventoActividad,idEquipoLocal,idEquipoVisitante,puntosLocal,puntosVisitante}=this.loginForm.value;
    const nuevoResultado:PartidoResultado={
      idEventoActividad:Number(idEventoActividad),
      idEquipoLocal:Number(idEquipoLocal),
      idEquipoVisitante:Number(idEquipoVisitante),
      puntosLocal:Number(puntosLocal),
      puntosVisitante:Number(puntosVisitante)
    };
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
      this.selectedEquipoId.set(null);
      this.equipos.set([]);
      if (this.selectedEventoId()) {
        this.onEventoChange(this.selectedEventoId()!.toString());
      }
      return;
    }

    this.selectedActividadId.set(id);
    this.selectedEquipoId.set(null);
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
  onEventoChangeCreate(eventoId: string): void {
    const id = Number(eventoId);
    
    if (!id) {
      this.selectIdEventoCreate.set(null);
      return;
    }
    this.selectIdEventoCreate.set(id);
  }
  public loadEventosActividad(): void {
    this.eventoService.getEventosCursoEscolar().pipe(
      switchMap(eventos =>{
        const idEvento=eventos.map(ev=>ev.idEvento);
        return forkJoin(
          idEvento.map(id=>this.actividadEventoService.getActividadEventoById(id).pipe(
            tap(actividadEvento => {
             
              const actividadesIds = actividadEvento.idActividad;
              this.equipoService.getEquiposPorActividadEvento(actividadesIds,this.selectIdEventoCreate()!).subscribe(equipos => {
                this.equipocreate.set(equipos);

              })

            }),
           
          ))        )
      })
    ).subscribe();
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

  deleteResultado(idPartidoResultado: number): void {

     if(idPartidoResultado===null) return;

    this.partidoResultadoService.deletePartidoResultado(idPartidoResultado).subscribe();

    const partidosActualizados = this.partidoResultados().filter(pr => pr.idPartidoResultado !== idPartidoResultado);
    this.partidoResultados.set(partidosActualizados);
    }

    


}   
   

