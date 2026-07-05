import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { Main } from './main/main';

export const routes: Routes = [
    {
    path: '', 
    component: Main // Pantalla principal con los botones
  },
  {
    path: 'destinos',
    loadComponent: () => 
      loadRemoteModule('destinos', './Component')
    .then((m) => m.SearchDestinos)
    .catch((err) => console.error(err)),
    //.catch((err) => import('./error-component').then(m => m.ErrorComponent)),
  },
  {
    path: 'ventas',
    loadComponent: () => 
      loadRemoteModule('ventas', './Component').then((m) => m.FormularioVentas),
    
  },
  {
    path: '**',
    redirectTo: ''
  }
];
