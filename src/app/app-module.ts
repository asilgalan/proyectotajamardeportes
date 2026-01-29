import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { LoginComponent } from './auth/components/loginComponent/loginComponent';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl } from '@angular/forms';
import { RouterLink, RouterModule,  } from '@angular/router';
import { authInterceptor } from './auth/interceptors/auth.interceptor';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';

import { PerfilComponent } from './components/perfil.component/perfil.component';
import { NavbarComponent } from './components/navbar.component/navbar.component';
import { HomeComponent } from './components/home.component/home.component';

import { EquipoComponent } from './components/equipo/equipo.component';
import { A } from '@angular/cdk/keycodes';
import { ActividadesComponent } from './components/actividades/actividades.component';
import { MaterialesComponent } from './components/materiales.component/materiales.component';
import { OrganizadorComponent } from './components/organizador.component/organizador.component';
import { PagosComponent } from './components/pagos.component/pagos.component';


@NgModule({
  declarations: [
    App,LoginComponent,PerfilComponent, NavbarComponent, HomeComponent, EquipoComponent,ActividadesComponent, MaterialesComponent, OrganizadorComponent, PagosComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    RouterLink,
    FullCalendarModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
   
  ],
  bootstrap: [App]
})
export class AppModule { }
