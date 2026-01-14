import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import Perfil from './models/Perfil';
import { LoginComponent } from './auth/components/loginComponent/loginComponent';
import { PerfilComponent } from './components/perfil.component/perfil.component';
import { HomeComponent } from './components/home.component/home.component';

export const routes: Routes = [
  {
    path: '',
      component:LoginComponent
  },
  {
    path: 'perfil', 
    component: PerfilComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

 }
