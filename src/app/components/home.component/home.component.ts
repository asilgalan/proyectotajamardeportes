import { Component, OnInit } from '@angular/core';
import { ServiceEventos } from '../../services/evento.service';
import { evento } from '../../models/evento';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  public eventos!: Array<evento>;
  now: string = new Date().toISOString();

  constructor(private _service: ServiceEventos){

  }

  ngOnInit(): void {
    this._service.getEventosCursoEscolar().subscribe(response => {
      console.log("Leyendo eventos");
      this.eventos = response;
    })
  }
}
