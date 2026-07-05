const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'ventas',



  exposes: {
    //'./Component': './projects/ventas/src/app/app.ts',
    './Component': './projects/ventas/src/app/formulario-ventas/formulario-ventas.ts',
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    // Forzamos específicamente primeng por si shareAll no lo toma bien
    "primeng": { 
      singleton: true, 
      strictVersion: true, 
      requiredVersion: 'auto' 
    },
    "primeng/api": { singleton: true },
    "primeng/button": { singleton: true },
    // Agregá los módulos que más uses si el error persiste
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Add further packages you don't need at runtime
  ],

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

  features: {
    // New feature for more performance and avoiding
    // issues with node libs. Comment this out to
    // get the traditional behavior:
    ignoreUnusedDeps: true
  }
});
