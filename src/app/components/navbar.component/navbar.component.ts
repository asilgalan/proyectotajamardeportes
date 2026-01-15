import { AuthService } from './../../auth/services/auth.service';
import { Component, inject, OnInit } from '@angular/core';
import Perfil from '../../models/perfil';
import ServicePerfil from '../../services/perfil.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  public perfil!:Perfil
   AuthService=inject(AuthService);

  constructor(private _service: ServicePerfil){

  }

  ngOnInit(): void {
    let token = localStorage.getItem('token');
    this._service.getPerfil().then(response => {
      this.perfil = response;
    })
  }

  logout() {
    this.AuthService.logout();
  }
}
