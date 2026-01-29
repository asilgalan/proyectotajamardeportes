import ServiceOrganizadores from '../../services/organizadores.service';
import { AuthService } from './../../auth/services/auth.service';
import { Component, inject, computed, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent  implements OnInit {
  public authService = inject(AuthService);
  public organizadorService=inject(ServiceOrganizadores);

  public perfil = computed(() => this.authService.currentUser());
  public isOrganizador: boolean = false;
 
 
  ngOnInit(): void {
     this.perfil();
     
     if (this.perfil()?.idUsuario) {
       this.verificarSiEsOrganizador();
     }
  }

  verificarSiEsOrganizador(): void {
    const userId = this.perfil()?.idUsuario;
    if (!userId) {
      return;
    }
    this.organizadorService.isOrganizador(userId)
      .subscribe({
        next: (isOrganizador) => {
          this.isOrganizador = isOrganizador;
        },
        error: (error) => {
          console.error('Error al verificar si es organizador:', error);
          this.isOrganizador = false;
        }
      });
  }
  logout() {
    this.authService.logout();
  }


}
 