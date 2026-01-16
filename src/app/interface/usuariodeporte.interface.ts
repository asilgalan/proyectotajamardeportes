export interface UsuarioDeporteResponse {
    id:                number;
    idEvento:          number;
    fechaEvento:       Date;
    idActividad:       number;
    nombreActividad:   string;
    idEventoActividad: number;
    idUsuario:         number;
    quiereSerCapitan:  boolean;
    fechaInscripcion:  Date;
}
