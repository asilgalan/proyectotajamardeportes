import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
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
import { AuthService } from '../../auth/services/auth.service';
import Perfil from '../../models/perfil';
import { CapitanActividadService } from '../../services/capitanActividad.service';
import ServiceOrganizadores from '../../services/organizadores.service';

@Component({
  selector: 'app-equipo.component',
  standalone: false,
  templateUrl: './equipo.component.html',
  styleUrl: './equipo.component.css',
})
export class EquipoComponent implements OnInit{
  public authService=inject(AuthService);
  public capitanService=inject(CapitanActividadService);
  public organizadorService=inject(ServiceOrganizadores);
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
  public idEquipoSeleccionado: number = 0;
  @ViewChild("nuevoMiembroId") nuevoMiembroId!: ElementRef;
  public estaInscrito: boolean = false;
  public usuarioLogueado!: Perfil;
  public isCapitan: boolean = false; 
  public isOrganizador: boolean = false;

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
      this.idEventoActividad = response.idEventoActividad;
      
      // Verificar si es capitán una vez tengamos el idEventoActividad
      if (this.usuarioLogueado?.idUsuario) {
        this.verificarSiEsCapitan();
        this.verificarSiEsOrganizador();
      }
    })

    this._serviceEquipo.getInscripcionesEventoActividad(this.idEvento, this.idActividad).subscribe(response => {
      this.miembrosInscripcion = response
    })

    this._serviceMiembrosEquipo.getUsuarioLogueado().subscribe(response => {
      this.usuarioLogueado = response;
      
  
      if (this.idEventoActividad) {
        this.verificarSiEsCapitan();
        this.verificarSiEsOrganizador();
      }
    })
  }

  verificarSiEsCapitan(): void {
    if (!this.usuarioLogueado?.idUsuario || !this.idEventoActividad) {
      return;
    }

    this.capitanService.isCapitan(this.usuarioLogueado.idUsuario, this.idEventoActividad)
      .subscribe({
        next: (isCapitan) => {
          this.isCapitan = isCapitan;
        },
        error: (error) => {
          console.error('Error al verificar si es capitán:', error);
          this.isCapitan = false;
        }
      });
  }

  verificarSiEsOrganizador(): void {
    if (!this.usuarioLogueado?.idUsuario) {
      return;
    }
    this.organizadorService.isOrganizador(this.usuarioLogueado.idUsuario)
      .subscribe({
        next: (isOrganizador) => {
          this.isOrganizador = isOrganizador;
        },
        error: (error) => {
          console.error('Error al verificar si es organizador:', error);
          this.isOrganizador = false;
        }
      });
  }

  cargarEquipos() {
      this._serviceEquipo.getEquiposPorActividadEvento(this.idActividad, this.idEvento).subscribe(response => {
          this.equipos = response;
          this.cargarNombresDeColores();
      });
  }

  funcionEstaInscrito(){
    this._serviceEquipo.getEquiposPorActividadEvento(this.idActividad, this.idEvento).subscribe(responseLosEquipos => {
      responseLosEquipos.forEach(elEquipo => {
        this._serviceEquipo.getUsuariosPorEquipo(elEquipo.idEquipo).subscribe(responseMiembros => {
          responseMiembros.forEach(unMiembro => {
            if (unMiembro.idUsuario == this.usuarioLogueado.idUsuario){
              this.estaInscrito = true;
            }
          });
        })
      });
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

  cargarMiembrosDelEquipo() {
    this._serviceMiembrosEquipo.getMiembrosDelEquipo(this.idEquipoSeleccionado).subscribe(response => {
        this.miembrosEquipo = response;
        this.showModalMiembrosEquipo = true;
    });
  }

  abrirModalMiembrosEquipo(idEquipo: number, nombreEquipo: string) {
    this.nombreEquipoSeleccionado = nombreEquipo;
    this.idEquipoSeleccionado = idEquipo;
    this.cargarMiembrosDelEquipo();
    this.funcionEstaInscrito();
  }

  cerrarModalMiembrosEquipo() {
    this.showModalMiembrosEquipo = false;
    this.estaInscrito = false;
  }

  insertMiembroAEquipo() {  
    let idUsuario = this.nuevoMiembroId.nativeElement.value;      
    this._serviceMiembrosEquipo.createMiembroEquipos(idUsuario, this.idEquipoSeleccionado).subscribe(() => {
        this.cargarMiembrosDelEquipo();
    });
  }

  eliminarMiembroDeEquipo(idMiembroEquipo: number) {
    this._serviceMiembrosEquipo.deleteMiembroEquiposPorId(idMiembroEquipo).subscribe(() => {
        this.cargarMiembrosDelEquipo();
    });
  }

  insertMiembroAEquipoToken() {  
    this._serviceMiembrosEquipo.insertMiembroEquiposToken(this.idEquipoSeleccionado).subscribe(() => {
        this.cargarMiembrosDelEquipo();
        this.funcionEstaInscrito();
    });
  }
}