export interface PartidoResultado {
    idPartidoResultado: number;
    idEventoActividad:  number;
    idEquipoLocal:      number;
    idEquipoVisitante:  number;
    puntosLocal:        number;
    puntosVisitante:    number;
    
    // Propiedades opcionales para datos enriquecidos
    nombreEquipoLocal?:     string;
    nombreEquipoVisitante?: string;
    nombreActividad?:       string;
}
