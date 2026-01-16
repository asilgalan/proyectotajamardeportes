export interface ActividadesResponse {
    idActividad:     number;
    nombre:          string;
    minimoJugadores: number;
}
export interface ActividadEventoResponse {
    posicion:          number;
    idEvento:          number;
    fechaEvento:       Date;
    idProfesor:        number;
    idActividad:       number;
    nombreActividad:   string;
    minimoJugadores:   number;
    idEventoActividad: number;
}
