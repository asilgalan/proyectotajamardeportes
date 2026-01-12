import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-component',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './loginComponent.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent { 

private fb=inject(FormBuilder)
authService=inject(AuthService)
router=inject(Router)


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

  this.authService.login(userName!,password!).subscribe({
    next:(response)=>{
      console.log('Login exitoso',response);

    },
    error:(error)=>{
      console.error('Error en el login',error);
      alert('Credenciales invalidas');
    }
  })    
}
}
