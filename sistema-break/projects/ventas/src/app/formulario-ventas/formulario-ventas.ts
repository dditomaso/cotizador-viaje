import { Component, signal } from '@angular/core';
import {email, form, FormField, PathKind, required, SchemaPathTree} from '@angular/forms/signals';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Router } from "@angular/router";

interface FormBreakData {
  correo: string;
  codigo: string;
  nombreGrupo: string;
  nombre: string;
  apellido: string;
  sexo: string;
  documento: string;
  fechaNacimiento: Date;
  celular: string;
  financiacion: string;
  instagram: string;
}

@Component({
  selector: 'app-formulario-ventas',
  imports: [FormField, CardModule, ButtonModule, SelectModule, InputNumberModule, InputTextModule, FormsModule],
  templateUrl: './formulario-ventas.html',
  styleUrl: './formulario-ventas.scss',
})
export class FormularioVentas {

  terminosYCondiciones = signal(false);
  
  breakModel = signal<FormBreakData>({
    correo: '',
    codigo: '',
    nombreGrupo: '',
    nombre: '',
    apellido: '',
    sexo: '',
    documento: '',
    fechaNacimiento: new Date('1995-01-01'),
    celular: '',
    financiacion: '',
    instagram: ''
  });

  private readonly WHATSAPP_PHONE = '5491172302027';

  // Calculamos las fechas límites
  private hoy = new Date();

  // Hoy menos 100 años
  public fechaMinima = new Date(
    this.hoy.getFullYear() - 100, 
    this.hoy.getMonth(), 
    this.hoy.getDate()
  ).toISOString().split('T')[0];

  // Hoy menos 18 años (Límite para mayores de edad)
  public fechaMaxima = new Date(
    this.hoy.getFullYear() - 18, 
    this.hoy.getMonth(), 
    this.hoy.getDate()
  ).toISOString().split('T')[0];

  formBreak = form(this.breakModel, (schemaPath) => {
      required(schemaPath.correo, {message: 'Email es requerido'});
      email(schemaPath.correo, {message: 'Por favor, ingrese una dirección de correo electrónico válida'});
      required(schemaPath.documento, {message: 'El documento es requerido'});
      required(schemaPath.sexo, {message: 'El sexo es requerido'});
      required(schemaPath.financiacion, {message: 'La financiación es requerida'});  
      required(schemaPath.nombre, {message: 'El nombre es requerido'});
      required(schemaPath.apellido, {message: 'El apellido es requerido'});
      required(schemaPath.celular, {message: 'El celular es requerido'});
      required(schemaPath.fechaNacimiento, {message: 'La fecha de nacimiento es requerida'});
      required(schemaPath.codigo, {message: 'El código de reserva es requerido'});
      required(schemaPath.nombreGrupo, {message: 'El nombre del grupo es requerido'});
  }); // Convertimos la signal a un observable para usar con async pipe
  
  constructor(private router: Router) {
    // Aquí podríamos cargar datos iniciales o hacer otras configuraciones
  }

/*   actualizarValidacionSexo(event: any) {
    const value = event.value;
    this.breakModel.update(prev => ({ ...prev, sexo: value }));
  } */

  onSubmit(event: Event) {
    event.preventDefault();
    // Perform login logic here
    const formBreak = this.formBreak().controlValue(); // Obtenemos los valores actuales del formulario
    console.log('Submitting form with:', formBreak);
    // e.g., await this.authService.login(credentials);
    // Construimos el mensaje para WhatsApp 
    const v = formBreak; // Para abreviar
    // Construimos el array de líneas para evitar espacios de indentación
    const lineas = [
      `¡Hola Break!`,
      `Te paso mis datos para avanzar con la reserva:`,
      `*Nombre:* ${v.nombre}`, 
      `*Apellido:* ${v.apellido}`,
      `*Email:* ${v.correo}`,
      `*DNI:* ${v.documento}`,
      `*Celular:* ${v.celular}`,
      `*Fecha de Nacimiento:* ${v.fechaNacimiento.toLocaleDateString()}`,
      `*Financiación:* ${v.financiacion}`,
      `*Nombre del Grupo:* ${v.nombreGrupo}`,
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
