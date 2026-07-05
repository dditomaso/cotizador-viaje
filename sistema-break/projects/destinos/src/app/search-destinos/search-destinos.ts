import { Component, inject, computed, signal, effect, untracked, runInInjectionContext, Injector } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { DecimalPipe } from '@angular/common'; // Para el pipe de número
import { Router } from '@angular/router';
import { DestinosService, Destino } from './destinos.service';

interface Periodo {
    mes: string;
    codigo: string;
}

interface Transporte {
    traslado: string;
    codigo: string;
}

interface TipoPaquete {
    paquete: string;
    codigo: string;
}

@Component({
  selector: 'app-search-destinos',
  imports: [ReactiveFormsModule, ButtonModule, SelectModule, InputNumberModule, CardModule, DecimalPipe],
  templateUrl: './search-destinos.html',
  styleUrl: './search-destinos.scss',
})
export class SearchDestinos {

  private readonly WHATSAPP_PHONE = '5491172302027';

  private fb = inject(FormBuilder);
  private injector = inject(Injector); // Inyectamos el inyector manualmente
  private destinosService = inject(DestinosService);

  // Datos fijos del negocio
  SENA_PESOS = 250000;
  ANIO_VIAJE = 2027;

  // Mapeo de meses para cálculos
  private mesesIndices: { [key: string]: number } = { 'enero': 0, 'febrero': 1, 'marzo': 2 };

  //Destinos Brasil
  destinos = signal<Destino[]>([]);
  destino: Destino | undefined;

  //Periodos
  periodo: Periodo[] | undefined;
  mes: Periodo | undefined;

  //transporte
  transporte: Transporte[] | undefined;
  traslado: Transporte | undefined;

  //Paquete
  tipoPaquete: TipoPaquete[] | undefined;
  paquete: TipoPaquete | undefined;

 

  form = this.fb.group({
    destino: ['Canasvieras', Validators.required],
    pasajeros: [1, [Validators.required, Validators.min(1)]],
    traslado: ['micro', Validators.required],
    paquete: ['ULC', Validators.required],
    mes: ['enero', [Validators.required, this.validarMargenFecha.bind(this)]], // Validador personalizado
    habitacion: ['estandar', Validators.required],
    comidaExtra: ['ninguna'] // desayuno, cena, media pension o ninguna
  });

  // Convertimos los cambios del form en una Signal para cálculos en tiempo real
  //formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value }); // NG0203: toSignal() can only be used within an injection context such as a constructor, a factory function, a field initializer, or a function used with `runInInjectionContext`. 
  /* public formValue = toSignal(this.form.valueChanges, { 
    initialValue: this.form.value,
    injector: this.injector // <--- ESTO fuerzo el contexto
  }); */

  // Creamos una signal manual
  public formValue = signal(this.form.value);

  public sub: any; // Para almacenar la suscripción y limpiarla luego
  public subDestinos: any;

  constructor(private router: Router) {

    // Escuchamos los cambios y actualizamos la signal manualmente
    this.sub = this.form.valueChanges.subscribe(val => {
      this.formValue.set(val);
    });

    this.subDestinos = this.destinosService.getDestinos().subscribe(res => {
      this.destinos.set(res);
    });

    this.periodo = [
        { mes: 'Enero', codigo: 'enero' },
        { mes: 'Febrero', codigo: 'febrero' },
        { mes: 'Marzo', codigo: 'marzo' }
    ];

    this.transporte = [
        { traslado: 'Micro', codigo: 'micro'},
        { traslado: 'Avión', codigo: 'avion'}
    ];

    this.tipoPaquete = [
        { paquete: 'Ultra Low Cost', codigo: 'ULC' },
        { paquete: 'Low Cost', codigo: 'LC' },
        { paquete: 'Flex', codigo: 'Flex' },
        { paquete: 'Full', codigo: 'Full' }
    ];

  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.subDestinos?.unsubscribe();
  }

   // --- VALIDADOR PERSONALIZADO ---
  validarMargenFecha(control: AbstractControl): ValidationErrors | null {
    const hoy = new Date();
    const mesSeleccionado = control.value;
    const indiceMes = this.mesesIndices[mesSeleccionado];
    
    // Fecha límite (1 mes antes del viaje)
    const fechaLimitePago = new Date(this.ANIO_VIAJE, indiceMes - 1, 1);

    // Si la fecha actual ya pasó la fecha límite de pago, el mes no es válido
    if (hoy >= fechaLimitePago) {
      return { margenInsuficiente: true };
    }
    return null;
  }

  // --- CÁLCULOS CON SIGNALS ---
  
  cuotasDisponibles = computed(() => {
    const hoy = new Date();
    const v = this.formValue();
    const indiceMes = this.mesesIndices[v.mes || 'enero'];
    
    const fechaLimite = new Date(this.ANIO_VIAJE, indiceMes - 1, 1);
    
    let meses = (fechaLimite.getFullYear() - hoy.getFullYear()) * 12;
    meses += fechaLimite.getMonth() - hoy.getMonth();
    
    return meses > 0 ? meses : 1; 
  });

  // Tabla de Precios
  precios = {
    micro: {
      ULC: { enero: 699, febrero: 699, marzo: 599 },
      LC:  { enero: 699, febrero: 699, marzo: 599 },
      Flex:{ enero: 950, febrero: 950, marzo: 850 },
      Full:{ enero: 1199, febrero: 1199, marzo: 1099 }
    },
    avion: {
      ULC: { enero: 950, febrero: 950, marzo: 890 },
      LC:  { enero: 1199, febrero: 1199, marzo: 1099 },
      Flex:{ enero: 1299, febrero: 1299, marzo: 1199 },
      Full:{ enero: 1460, febrero: 1460, marzo: 1360 }
    }
  };


  // Creamos las opciones dinámicamente según las reglas de negocio
  opcionesComida = computed(() => {
    const pkg = this.formValue()?.paquete;
    console.log('pkg: ',pkg );
    // Opción base siempre presente
    const base = [{ label: 'Sin extras de comida', value: 'ninguna' }];

    if (pkg === 'UCL' || pkg === 'LC') {
      return [
        ...base,
        { label: 'Agregar Desayuno', value: 'desayuno' },
        { label: 'Agregar Cena', value: 'cena' },
        { label: 'Agregar Media Pensión', value: 'media pension' }
      ];
    } 
    
    if (pkg === 'Flex') {
      return [
        ...base,
        { label: 'Agregar Cena (Ya incluye Desayuno)', value: 'cena' }
      ];
    }

    if (pkg === 'Full') {
      return [{ label: 'Ya incluye Media Pensión', value: 'ninguna', disabled: true }];
    }  
    // Para el paquete UCL|LC o casos por defecto
    return [
        ...base,
        { label: 'Agregar Desayuno', value: 'desayuno' },
        { label: 'Agregar Cena', value: 'cena' },
        { label: 'Agregar Media Pensión', value: 'media pension' }
      ];
  });


  totalUSDPerPersona = computed(() => {
    const v = this.formValue();
    if (!v.traslado || !v.paquete || !v.mes || this.form.get('mes')?.invalid) return 0;
    
    // @ts-ignore
    let precio = this.precios[v.traslado][v.paquete][v.mes] * v.pasajeros;
    
    // Extras
    if (v.comidaExtra === 'desayuno') precio += 50;
    if (v.comidaExtra === 'cena') precio += 90;
    if (v.comidaExtra === 'media pension') precio += 130;

    return precio;
  });

  montoCuotaUSD = computed(() => this.totalUSDPerPersona() / this.cuotasDisponibles());

  montoPaqueteSeleccionado = computed(() => this.totalUSDPerPersona() );

  reserva = computed(() => {
    const v = this.formValue();
    if(!v.pasajeros){
      v.pasajeros = 1;
    }

    return this.SENA_PESOS * v.pasajeros;
  });

  enviarCotizacion() {
    const v = this.form.getRawValue(); // Usamos getRawValue por si hay campos disabled
    const destino = v.destino;

    // Construimos el array de líneas para evitar espacios de indentación
    const lineas = [
      `¡Hola Break!`,
      `Me interesa esta cotización:`,
      `*Destino:* ${v.destino}`, // 🚢
      `*Pasajeros:* ${v.pasajeros}`, // 👥
      `*Mes:* ${v.mes} 2027`, // 📅
      `*Paquete:* ${v.paquete} (${v.traslado})`, // 📦
      `*Extras:* ${v.comidaExtra}`, // 🍽️
      ``,
      `*Resumen del Plan:*`,
      `*Seña:* $${this.SENA_PESOS.toLocaleString()} ARS por persona.`, // 💰
      `*Cuotas:* ${this.cuotasDisponibles()} pagos de *U$D ${Math.round(this.montoCuotaUSD())}*`, // 💵
      `_(Financiación interna sin interés)_`,
      ``,
      `¿Me podrían dar más información?`
    ];

    // UNIÓN Y CODIFICACIÓN MANUAL
    const textoFinal = lineas.join('\n');
    const url = `https://wa.me/${this.WHATSAPP_PHONE}?text=${encodeURIComponent(textoFinal)}`;
    
    // Abrimos en ventana nueva
    window.open(url, '_blank');
  }

  inicio() {
    // Lógica para redirigir a la página de inicio
    this.router.navigate(['/']);
  }
  

}
