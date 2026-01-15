import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { LoginComponent } from './auth/components/loginComponent/loginComponent';
import { ReactiveFormsModule,FormGroup,FormControl } from '@angular/forms';
import { RouterLink, RouterModule,  } from '@angular/router';
import { authInterceptor } from './auth/interceptors/auth.interceptor';
import { CommonModule } from '@angular/common';

import { PerfilComponent } from './components/perfil.component/perfil.component';
import { NavbarComponent } from './components/navbar.component/navbar.component';
import { HomeComponent } from './components/home.component/home.component';

import { EquipoComponent } from './components/equipo/equipo.component';


@NgModule({
  declarations: [
    App,LoginComponent,PerfilComponent, NavbarComponent, HomeComponent, EquipoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,ReactiveFormsModule,CommonModule,RouterModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor]))
  ],
  bootstrap: [App]
})
export class AppModule { }
