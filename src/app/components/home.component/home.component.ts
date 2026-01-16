import { Component, inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ServiceEventos } from '../../services/evento.service';
import { evento } from '../../models/evento';
import { ActividadesService } from '../../services/actividades.service';

import ServicePerfil from '../../services/perfil.service';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import Perfil from '../../models/Perfil';

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

  private actividadesService = inject(ActividadesService);

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
    displayEventTime: false
  };

  constructor(private _service: ServiceEventos, private _servicePerfil: ServicePerfil){

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

      const eventosCalendario = this.eventos.map(evento => {
        return {
          title: `Evento`,
          start: evento.fechaEvento,
          color: (evento.fechaEvento < this.now) ? '#64748b' : '#2563eb'
        };
      });

      this.calendarOptions = { ...this.calendarOptions, events: eventosCalendario };
    })

    this._servicePerfil.getPerfil().then(response => {
      this.perfil = response;
    })
  }

  onclickEvento(idEvento:number){
    this.idEvento=idEvento;
     console.log(this.idEvento);
  this.actividadesService.getActividadesByIdEnvento(this.idEvento).subscribe();

  }
}
