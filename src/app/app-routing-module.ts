import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import Perfil from './models/perfil';
import { LoginComponent } from './auth/components/loginComponent/loginComponent';
import { PerfilComponent } from './components/perfil.component/perfil.component';
import { HomeComponent } from './components/home.component/home.component';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
      component:LoginComponent
  },
  {
    path: 'perfil', 
    component: PerfilComponent,
    canActivate: [authGuard]
  },
    {
    path: 'home', 
    component: HomeComponent,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

 }
