export class actividadEvento {
    constructor(
        public posicion: number,
        public idEvento: number,
        public fechaEvento: Date,
        public idProfesor: number,
        public idActividad: number,
        public nombreActividad: string,
        public minimoJugadores: number,
        public idEventoActividad: number,
    ){}
}