export interface ActividadEvento {
    idEventoActividad: number;
    idEvento:          number;
    idActividad:       number;
}

// Para crear, sin el ID (se genera en el backend)
export interface ActividadEventoCreate {
    idEvento:    number;
    idActividad: number;
}
