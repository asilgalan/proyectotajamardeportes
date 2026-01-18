import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import Perfil from './models/Perfil';
import { LoginComponent } from './auth/components/loginComponent/loginComponent';
import { PerfilComponent } from './components/perfil.component/perfil.component';
import { HomeComponent } from './components/home.component/home.component';
import { EquipoComponent } from './components/equipo/equipo.component';

export const routes: Routes = [
  {
    path: '',
      component:LoginComponent
  },
  {
    path: 'perfil', 
    component: PerfilComponent
  },
  
  {
    path: 'home', 
    component: HomeComponent
  },
  {
    path: 'equipos/:idactividad/:idevento', 
    component: EquipoComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

 }
