import { AuthService } from './../../auth/services/auth.service';
import { Component, inject, computed, OnInit } from '@angular/core';
import Perfil from '../../models/perfil';
import ServicePerfil from '../../services/perfil.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  public authService = inject(AuthService);

  public perfil = computed(() => this.authService.currentUser());

  logout() {
    this.authService.logout();
  }
}
