import { Component, OnInit } from '@angular/core';
import { Curso } from '../../models/curso';
import Alumno from '../../models/alumno';
import ServiceOrganizadores from '../../services/organizadores.service';
import ServiceGestion from '../../services/gestion.service';

@Component({
  selector: 'app-organizador',
  standalone: false,
  templateUrl: './organizador.component.html',
  styleUrl: './organizador.component.css',
})
export class OrganizadorComponent implements OnInit
{
  public cursos: Curso[] = [];
  public alumnos: Alumno[] = [];

  public showToast = false;
  public toastTipo: 'success' | 'error' = 'success';
  public toastMensaje = '';
  
  public organizadores:Alumno[] = [];

  constructor(private _serviceOrganizadores:ServiceOrganizadores,
              private _serviceGestion:ServiceGestion){}

  ngOnInit(): void 
  {
    this._serviceGestion.getCursosActivos().then(response =>
    {
      this.cursos = response;
    })

    this.mostrarOrganizadores();
  }

  seleccionarCurso(idCurso:string): void
  {
    const id = Number(idCurso);

    this.alumnos = [];
    this._serviceGestion.getUsuariosPorCurso(id).then(response =>
    {
      this.alumnos = response;
    })
  }

  elegirOrganizador(idAlumno:string): void
  {
    if (idAlumno != null)
    {
      const id = Number(idAlumno);

      this._serviceOrganizadores.postOrganizador(id).then(response =>
      {
        this.lanzarToast('success', '¡Organizador añadido correctamente!');
        this.mostrarOrganizadores();
      })
    }
  }

  eliminarOrganizador(idAlumno:string): void
  {
    if (idAlumno != null)
    {
      const id = Number(idAlumno);

      this._serviceOrganizadores.deleteOrganizador(id).then(response =>
      {
        console.log(response);
        this.lanzarToast('error', 'Organizador eliminado correctamente');
        this.mostrarOrganizadores();
      })
    }
  }

  mostrarOrganizadores():void
  {
    this._serviceOrganizadores.getOrganizadores().then(response =>
    {
      this.organizadores = response;
    })
  }

  lanzarToast(tipo: 'success' | 'error', mensaje: string): void 
  {
    this.toastTipo = tipo;
    this.toastMensaje = mensaje;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3500);
  }
}
