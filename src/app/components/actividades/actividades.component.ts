import { Component, inject, Input, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { ActividadesService } from '../../services/actividades.service';
import { ActividadesResponse, ActividadEventoResponse } from '../../interface/actividades.interface';
import { tap } from 'rxjs';

@Component({
  selector: 'app-actividades',
  standalone: false,
  templateUrl: './actividades.component.html',
  styleUrl: './actividades.component.css',
})
export class ActividadesComponent implements OnInit,OnChanges {


  
  private actividadesService=inject(ActividadesService);
  public actividades=signal<ActividadesResponse[]>([]);
  public actividadEvento=signal<ActividadEventoResponse[] | []>([]);
  
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
      tap(actividades => this.actividadEvento.set(actividades))
    )
    .subscribe();
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

    UniserActividad(idActividad:number){
    console.log("Te has unido a la actividad");
  }
  
  showDetails(actividad: number) {
    console.log("Ver detalles de:", actividad);
   
  }
  
  isFutureEvent(fechaEvento: Date): boolean {
    const eventoDate = new Date(fechaEvento);
    const currentDate = new Date();
    return eventoDate > currentDate;
  }
}
