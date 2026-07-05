import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface Destino {
    nombre: string;
    codigo: string;
}

@Injectable({
  providedIn: 'root'
})
export class DestinosService {

  constructor() { }

  getDestinos(): Observable<Destino[]> {
    const mockDestinos: Destino[] = [
        { nombre: 'Canasvieras', codigo: 'Canasvieras' },
        { nombre: 'Ferrugem', codigo: 'Ferrugem' },
        { nombre: 'Praia Do Rosa', codigo: 'Praia Do Rosa' }
    ];
    
    // Simulamos una llamada a una API agregando un delay
    return of(mockDestinos).pipe(delay(500));
  }
}
