import { Component, OnInit } from '@angular/core';
import Perfil from '../../models/Perfil';
import ServicePerfil from '../../services/perfil.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  public perfil!:Perfil

  constructor(private _service: ServicePerfil){

  }

  ngOnInit(): void {
    let token = localStorage.getItem('token');
    this._service.getPerfil(token).then(response => {
      this.perfil = response;
    })
  }
}
