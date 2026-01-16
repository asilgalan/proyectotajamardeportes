import { Component, inject, Input, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { ActividadesService } from '../../services/actividades.service';
import { ActividadesResponse, ActividadEventoResponse } from '../../interface/actividades.interface';
import { tap } from 'rxjs';
import { InscripcionesService } from '../../services/inscripciones.service';
import { A } from '@angular/cdk/keycodes';
import { AuthService } from '../../auth/services/auth.service';
import { InscripcionesResponse } from '../../interface/inscripciones.interface';
import { UsuarioDeporteService } from '../../services/usuarioDeporte.service';
import { UsuarioDeporteResponse } from '../../interface/usuariodeporte.interface';


@Component({
  selector: 'app-actividades',
  standalone: false,
  templateUrl: './actividades.component.html',
  styleUrl: './actividades.component.css',
})
export class ActividadesComponent implements OnInit,OnChanges {


  
  private actividadesService=inject(ActividadesService);
  private inscripcionService=inject(InscripcionesService);
  private authService=inject(AuthService);
  private usuariodeporteService=inject(UsuarioDeporteService);
  private InscripcionesResponse=signal<InscripcionesResponse | null>(null);
  public actividades=signal<(ActividadEventoResponse & { estaInscrito: UsuarioDeporteResponse[] })[]>([]);
  public actividadEvento=signal<ActividadEventoResponse[] | []>([]);
  

  public showModal = signal<boolean>(false);
  public quiereSerCapitan = signal<boolean>(false);
  private actividadSeleccionada = signal<{idEventoActividad: number} | null>(null);

  public showModalDesapuntar = signal<boolean>(false);
  private inscripcionSeleccionada = signal<{idInscripcion: number, idEventoActividad: number} | null>(null);

   
  
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


}
