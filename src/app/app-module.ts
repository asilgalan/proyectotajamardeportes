import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { LoginComponent } from './auth/components/loginComponent/loginComponent';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { authInterceptor } from './auth/interceptors/auth.interceptor';
import { PerfilComponent } from './auth/components/perfil.component/perfil.component';
import ServicePerfil from './auth/services/service.perfil';

@NgModule({
  declarations: 
  [
    App,
    PerfilComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LoginComponent
  ],
  providers: [

    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    ServicePerfil
  ],
  bootstrap: [App]
})
export class AppModule { }
