import { Routes } from '@angular/router';
import { SearchDestinos } from './search-destinos/search-destinos';
import { CotizadorDestinos } from './cotizador-destinos/cotizador-destinos';

export const routes: Routes = [
    { path: '', redirectTo: 'destinos', pathMatch: 'full' },
    { path: 'destinos', component: SearchDestinos },
    { path: '**', redirectTo: 'destinos' },
    { path: 'cotizador-destinos', component: CotizadorDestinos}
];
