export interface InscripcionesResponse {
    idInscripcion?:     number;
    idUsuario:         number;
    idEventoActividad: number;
    quiereSerCapitan:  boolean;
    fechaInscripcion:  Date;
}

export interface IncripcionesEventoResponse {
    idUsuario:        number;
    usuario:          string;
    estadoUsuario:    boolean;
    imagen:           string;
    email:            string;
    idRole:           number;
    role:             string;
    idCurso:          number;
    curso:            string;
    fechaInicioCurso: Date;
    fechaFinCurso:    Date;
    idCursosUsuarios: number;
}
