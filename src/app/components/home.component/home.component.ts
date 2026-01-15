import { Component, inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ServiceEventos } from '../../services/evento.service';
import { evento } from '../../models/evento';
import { ActividadesService } from '../../services/actividades.service';

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

  private  actividadesService=inject(ActividadesService);

  constructor(private _service: ServiceEventos){

  }
 ngOnChanges(changes: SimpleChanges): void {
        if (changes['idEvento'] && !changes['idEvento'].isFirstChange()) {
          const val = changes['idEvento'].currentValue as number;
          if (val != null) this.actividadesService.getActividadesByIdEnvento(val);
        }
      }


  ngOnInit(): void {
    this._service.getEventosCursoEscolar().subscribe(response => {
      console.log("Leyendo eventos");
      this.eventos = response;
    })
  }

  onclickEvento(idEvento:number){
    this.idEvento=idEvento;
     console.log(this.idEvento);
  this.actividadesService.getActividadesByIdEnvento(this.idEvento).subscribe();

  }
}
