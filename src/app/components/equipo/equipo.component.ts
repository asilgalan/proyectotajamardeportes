import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EquipoService } from '../../services/equipo.service';
import { Equipo } from '../../models/equipo';
import { ActivatedRoute, Params } from '@angular/router';
import { ActividadesService } from '../../services/actividades.service';
import { ServiceEventos } from '../../services/evento.service';
import { ColorService } from '../../services/colores.service';
import { Color } from '../../models/color';
import { Curso } from '../../models/curso';
import { UsuariosInscripciones } from '../../models/usuariosInscripciones';
import { MiembrosDelEquipo } from '../../models/miembrosDelEquipo';
import { MiembroEquiposService } from '../../services/miembroEquipos.service';

@Component({
  selector: 'app-equipo.component',
  standalone: false,
  templateUrl: './equipo.component.html',
  styleUrl: './equipo.component.css',
})
export class EquipoComponent implements OnInit{
  public equipos: Array<Equipo> = [];
  public idActividad!: number;
  public idEvento!: number;
  public nombreActividad!: string;
  public fechaEvento!: string;
  public mapaColores: { [key: number]: string } = {};

  public showModalColores: boolean = false;
  public colores!: Array<Color>;
  @ViewChild("cajaColor") nuevoColor!: ElementRef;

  public showModalEliminar: boolean = false;
  public idEquipoAEliminar: number | null = null;

  public showModalNuevoEquipo: boolean = false;
  public cursos!: Array<Curso>;
  public idEventoActividad!: number;
  @ViewChild("cajaNombreEquipo") cajaNombreEquipo!: ElementRef;
  @ViewChild("cajaMinJugadores") cajaMinJugadores!: ElementRef;
  @ViewChild("cajaColorEquipo") cajaColorEquipo!: ElementRef;
  @ViewChild("cajaidCursoEquipo") cajaidCursoEquipo!: ElementRef;

  public showModalEditarEquipo: boolean = false;
  public equipoUpdate!: Equipo;
  @ViewChild("cajaUpdateNombre") cajaUpdateNombre!: ElementRef;
  @ViewChild("cajaUpdateMin") cajaUpdateMin!: ElementRef;
  @ViewChild("cajaUpdateColor") cajaUpdateColor!: ElementRef;
  @ViewChild("cajUpdateCurso") cajUpdateCurso!: ElementRef;
  @ViewChild("cajaUpdateid") cajaUpdateid!: ElementRef;

  public showModalInscritos: boolean = false;
  public miembrosInscripcion: Array<UsuariosInscripciones> = [];

  public showModalMiembrosEquipo: boolean = false;
  public miembrosEquipo: Array<MiembrosDelEquipo> = [];
  public nombreEquipoSeleccionado: string = "";

  constructor(private _serviceEquipo: EquipoService, private _activateRoute: ActivatedRoute, private _serviceActividaes: ActividadesService, private _serviceEvento: ServiceEventos, private _serviceColor: ColorService, private _serviceMiembrosEquipo: MiembroEquiposService){

  }

  ngOnInit(): void {
    this._activateRoute.params.subscribe((params: Params) => {
      this.idActividad = params["idactividad"];
      this.idEvento = params["idevento"];
      this.cargarEquipos();
    })

    this._serviceActividaes.getActividadesById(this.idActividad).subscribe(response => {
      this.nombreActividad = response.nombre;
    })

    this._serviceEvento.getEventoPorId(this.idEvento).subscribe(response => {
      this.fechaEvento = response.fechaEvento;
    })

    this._serviceColor.getColores2().subscribe(response => {
      this.colores = response;
    })

    this._serviceEquipo.getCursosActivos().subscribe(response => {
      this.cursos = response;
    })

    this._serviceEquipo.getIdEventoActividadEquipos(this.idEvento, this.idActividad).subscribe(response => {
      this.idEventoActividad = response.idEventoActividad
    })

    this._serviceEquipo.getInscripcionesEventoActividad(this.idEvento, this.idActividad).subscribe(response => {
      this.miembrosInscripcion = response
    })
  }

  cargarEquipos() {
      this._serviceEquipo.getEquiposPorActividadEvento(this.idActividad, this.idEvento).subscribe(response => {
          this.equipos = response;
          this.cargarNombresDeColores();
      });
  }

  cargarNombresDeColores() {
    if (!this.equipos) return;

    this.equipos.forEach(equipo => {
      const id = equipo.idColor;
      if (id && !this.mapaColores[id]) {
        this.mapaColores[id] = 'Cargando...';
        
        this._serviceColor.getColoresById(id).subscribe({
          next: (color) => {
            this.mapaColores[id] = color.nombreColor; 
          },
          error: (err) => {
            console.error(`Error cargando color ${id}`, err);
            this.mapaColores[id] = 'Error';
          }
        });
      }
    });
  }

  abrirModalColores() {
    this.showModalColores = true;
  }

  cerrarModalColores() {
    this.showModalColores = false;
  }

  insetarColor(){
    let nuevoColor = this.nuevoColor.nativeElement.value;
    this._serviceColor.CrearColor(nuevoColor).subscribe(()=> {
      this._serviceColor.getColores2().subscribe(response => {
        this.colores = response;
      })
    })
  }

  deleteColor(idColor: number){
    this._serviceColor.deleteColor(idColor).subscribe(() => {
      this._serviceColor.getColores2().subscribe(response => {
        this.colores = response;
      })
    })
  }

  abrirModalEliminar(id: number) {
    this.idEquipoAEliminar = id;
    this.showModalEliminar = true;
  }

  cerrarModalEliminar() {
    this.idEquipoAEliminar = null;
    this.showModalEliminar = false;
  }

  confirmarBorrado() {
    if (this.idEquipoAEliminar) {
      this._serviceEquipo.deleteEquipoPorId(this.idEquipoAEliminar).subscribe(() => {
        this.cargarEquipos();
        this.cerrarModalEliminar();
      });
    }
  }

  abrirModalCrearEquipo() {
    this.showModalNuevoEquipo = true;
  }

  cerrarModalCrearEquipo() {
    this.showModalNuevoEquipo = false;
  }

  guardarNuevoEquipo() {
    let nombre = this.cajaNombreEquipo.nativeElement.value;
    let min = parseInt(this.cajaMinJugadores.nativeElement.value);
    let color = parseInt(this.cajaColorEquipo.nativeElement.value);
    let curso = parseInt(this.cajaidCursoEquipo.nativeElement.value);

    let equipo = new Equipo(0, this.idEventoActividad, nombre, min, color, curso);

    this._serviceEquipo.createEquipo(equipo).subscribe(() => {
      this.cargarEquipos();
      this.cerrarModalCrearEquipo();
    })
  }

  abrirModalEditar(id: number) {    
    this.showModalEditarEquipo = true;
    this._serviceEquipo.getEquipoPorId(id).subscribe(response => {
      this.equipoUpdate = response;
    })
  }

  cerrarModalEditar() {
    this.showModalEditarEquipo = false;
  }

  actualizarEquipo() {    
    let id = parseInt(this.cajaUpdateid.nativeElement.value);
    let nombre = this.cajaUpdateNombre.nativeElement.value;
    let min = parseInt(this.cajaUpdateMin.nativeElement.value);
    let color = parseInt(this.cajaUpdateColor.nativeElement.value);
    let curso = parseInt(this.cajUpdateCurso.nativeElement.value);

    let equipo = new Equipo(id, this.idEventoActividad, nombre, min, color, curso);

    this._serviceEquipo.updateEquipo(equipo).subscribe(() => {
      this.cargarEquipos();
      this.cerrarModalEditar();
    })
  }

  verInscritos() {
    this.showModalInscritos = true;
  }

  cerrarModalInscritos() {
    this.showModalInscritos = false;
  }

  abrirModalMiembrosEquipo(idEquipo: number, nombreEquipo: string) {
    console.log("Entra 1");
    this.nombreEquipoSeleccionado = nombreEquipo;
    
     this._serviceMiembrosEquipo.getMiembrosDelEquipo(idEquipo).subscribe(response => {
         this.miembrosEquipo = response;
         this.showModalMiembrosEquipo = true;
         console.log("consulta hecha");
     });
  }

  cerrarModalMiembrosEquipo() {
    this.showModalMiembrosEquipo = false;
  }
}