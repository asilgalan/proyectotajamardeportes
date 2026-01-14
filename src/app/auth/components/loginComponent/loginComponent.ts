import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-component',
  standalone: false,
  templateUrl: './loginComponent.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {


private fb=inject(FormBuilder)
authService=inject(AuthService)
router=inject(Router)
mensajeError:string=''


loginForm=this.fb.group({
  userName:['',[Validators.required]],
  password:['', [Validators.required, Validators.minLength(5)]] 
})

onSubmit(){
  if(this.loginForm.invalid){
    this.loginForm.markAllAsTouched();
    return;
  }

   const {userName,password}=this.loginForm.value;
   const emailCompleto = `${userName}@tajamar365.com`;
  this.authService.login(emailCompleto!,password!).subscribe({
    next:(response)=>{
      this.router.navigate(['/perfil']);
      console.log('Login exitoso',response);
    },
    error:(error)=>{
      console.error('Error en el login',error);
      this.mensajeError='Usuario o contraseña incorrectos';
    }
  })    
}
}
