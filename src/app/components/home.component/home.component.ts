import { Component, OnInit } from '@angular/core';
import { ServiceEventos } from '../../services/evento.service';
import { evento } from '../../models/evento';
import Perfil from '../../models/Perfil';
import ServicePerfil from '../../services/perfil.service';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  public eventos!: Array<evento>;
  now: string = new Date().toISOString();
  public perfil!:Perfil

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

    let token = localStorage.getItem('token');
    this._servicePerfil.getPerfil(token).then(response => {
      this.perfil = response;
    })
  }
}
