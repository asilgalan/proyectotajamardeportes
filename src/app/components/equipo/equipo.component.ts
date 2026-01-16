import { Component, inject } from '@angular/core';
import { EquipoService } from '../../services/equipo.service';

@Component({
  selector: 'app-equipo.component',
  standalone: false,
  templateUrl: './equipo.component.html',
  styleUrl: './equipo.component.css',
})
export class EquipoComponent {


  private equiposervice=inject(EquipoService);
}
