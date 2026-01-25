export class Curso {
    constructor(
        public idCurso: number,
        public nombre: string,
        public fechaInicio: string,
        public fechaFin: number,
        public activo: boolean,
    ){}
}