import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/components/loginComponent/loginComponent';
import { PerfilComponent } from './components/perfil.component/perfil.component';
import { HomeComponent } from './components/home.component/home.component';
import { EquipoComponent } from './components/equipo/equipo.component';
import { MaterialesComponent } from './components/materiales.component/materiales.component';
import { authGuard } from './auth/guards/auth.guard';
import { PartidoResultadoComponent } from './components/partidoResultado/partidoResultado.component';

export const routes: Routes = [
  {
    path: '',
      component:LoginComponent,
  
 
  },
         
 {
    path: 'perfil', 
    component: PerfilComponent,

  },
  
  {
    path: 'home', 
    component: HomeComponent,
   
  },
  {
    path: 'equipos/:idactividad/:idevento', 
    component: EquipoComponent,
 
  },
  {
    path: 'materiales', 
    component: MaterialesComponent
  },
  {

    path:'partido-resultado',
    component:PartidoResultadoComponent

  },

  {
    path: '**', 
    redirectTo: ''
  }
 

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

 }
