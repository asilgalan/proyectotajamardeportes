import { Component, inject, OnChanges, OnInit, SimpleChanges, signal } from '@angular/core';
import { ServiceEventos } from '../../services/evento.service';
import { evento } from '../../models/evento';
import { ActividadesService } from '../../services/actividades.service';

import ServicePerfil from '../../services/perfil.service';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import Perfil from '../../models/perfil';

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

  public showModalAddEvento = false;
  public fechaSeleccionada: string | null = null;

  public showModalCancelEvento = false;
  public eventoSeleccionado: any = null;
  nombre=signal<string >('');
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
    displayEventTime: false,
    dateClick: this.onDateClick.bind(this),
    eventClick: this.onEventClick.bind(this)
  };

  constructor(private _service: ServiceEventos, private _servicePerfil: ServicePerfil){ }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idEvento'] && !changes['idEvento'].isFirstChange()) {
      const val = changes['idEvento'].currentValue as number;
      if (val != null) this.actividadesService.getActividadesByIdEnvento(val);
    }
  }

  ngOnInit(): void {
   
    this.getEventoCurosEscolar();
  }

  getEventoCurosEscolar(){
     this._service.getEventosCursoEscolar().subscribe(response => {
      this.eventos = response;
     
      const eventosCalendario = this.eventos.map(evento => {
        const esPasado = evento.fechaEvento < this.now;
        const titulo = esPasado ? 'Evento pasado' : 'Evento futuro';
        const colorFondo = esPasado ? '#64748b' : '#2563eb';
        const colorTexto = esPasado ? '#94a3b8' : '#ffffff';

        return {
          id: evento.idEvento.toString(),
          title: titulo,
          start: evento.fechaEvento,
          backgroundColor: colorFondo,
          borderColor: colorFondo,
          textColor: colorTexto,
          classNames: [esPasado ? 'evento-pasado' : 'evento-futuro']
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
    this.actividadesService.getActividadesByIdEnvento(this.idEvento).subscribe();

  }

  onDateClick(arg: any) {

    this.fechaSeleccionada = arg.dateStr;

    

    this.showModalAddEvento = true;
  }

  cerrarModalAddEvento() {
    this.showModalAddEvento = false;
    this.fechaSeleccionada = null;
  }

  cerrarModalCancelEvento() {
    this.showModalCancelEvento = false;
    this.eventoSeleccionado = null;
  }

  confirmarAddEvento() {
    if (!this.fechaSeleccionada || this.fechaSeleccionada < this.now) return;
    
    this._service.createEvento(this.fechaSeleccionada).subscribe(()=>{
      this.getEventoCurosEscolar();
      this.cerrarModalAddEvento();
    });
  }

  onEventClick(arg: any) {
    const idEvento = parseInt(arg.event.id);
    const evento = this.eventos.find(ev => ev.idEvento === idEvento);
    if (evento) {
      this.eventoSeleccionado = evento;
      this.showModalCancelEvento = true;
    }
  }

  confirmarCancelEvento() {
    if (!this.eventoSeleccionado || this.eventoSeleccionado.fechaEvento < this.now) return;
    
    this._service.deleteEventoById(this.eventoSeleccionado.idEvento).subscribe(()=>{
      this.getEventoCurosEscolar();
      this.cerrarModalCancelEvento();
    });
  }
}
