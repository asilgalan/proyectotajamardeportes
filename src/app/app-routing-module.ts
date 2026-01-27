import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/components/loginComponent/loginComponent';
import { PerfilComponent } from './components/perfil.component/perfil.component';
import { HomeComponent } from './components/home.component/home.component';
import { EquipoComponent } from './components/equipo/equipo.component';
import { MaterialesComponent } from './components/materiales.component/materiales.component';
import { OrganizadorComponent } from './components/organizador.component/organizador.component';
import { PagosComponent } from './components/pagos.component/pagos.component';

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
  {
    path: 'materiales', 
    component: MaterialesComponent
  },
  {
    path: 'organizador', 
    component: OrganizadorComponent
  },
  {
    path: 'pagos', 
    component: PagosComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

 }
