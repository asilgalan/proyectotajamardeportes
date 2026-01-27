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

  constructor(private _serviceOrganizadores:ServiceOrganizadores,
              private _serviceGestion:ServiceGestion){}

  ngOnInit(): void 
  {
    this._serviceGestion.getCursosActivos().then(response =>
    {
      this.cursos = response;
    })  
  }

  seleccionarCurso(idCurso:string): void
  {
    const id = Number(idCurso);

    this._serviceGestion.getUsuariosPorCurso(id).then(response =>
    {
      this.alumnos = response;
    })
  }
}
