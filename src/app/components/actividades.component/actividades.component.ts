import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { ActividadesService } from '../../services/actividades.service';
import { ActividadesResponse } from '../../interface/actividades.interface';
import { tap } from 'rxjs';

@Component({
  selector: 'app-actividades',
  standalone: false,
  templateUrl: './actividades.component.html',
  styleUrls: ['./actividades.component.css'],
})
export class ActividadesComponent implements OnInit {

  
  private actividadesService=inject(ActividadesService);
  public actividades=signal<ActividadesResponse[]>([]);
  
  @Input() idEvento!:number;

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
      tap(actividades => this.actividades.set(actividades))
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

}
