import { Routes } from '@angular/router';
import { FormularioVentas } from './formulario-ventas/formulario-ventas';

export const routes: Routes = [
    { path: '', redirectTo: 'ventas', pathMatch: 'full' },
    { path: 'ventas', component: FormularioVentas },
    { path: '**', redirectTo: 'ventas' }
];
