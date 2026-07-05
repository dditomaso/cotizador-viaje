import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Mensaje {
  emisor: 'usuario' | 'ia';
  texto: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/chat'; // Cambiar por tu URL de NestJS

  // 1. Signal que maneja el estado reactivo del historial de la interfaz
  mensajesSignal = signal<Mensaje[]>([]);
  
  // Guardamos un ID de sesión único para esta pestaña del navegador
  private sessionId = this.obtenerOGenerarSessionId();

  // 2. Método reactivo eficiente para enviar mensajes
  async enviarMensaje(textoMensaje: string): Promise<void> {
    if (!textoMensaje.trim()) return;

    // Actualizamos el signal agregando el mensaje del usuario inmediatamente en pantalla
    this.mensajesSignal.update(mensajes => [
      ...mensajes,
      { emisor: 'usuario', texto: textoMensaje }
    ]);

    try {
      // Hacemos el POST al backend usando firstValueFrom para manejarlo con async/await limpio
      const res = await firstValueFrom(
        this.http.post<{ respuesta: string }>(this.apiUrl, {
          mensaje: textoMensaje,
          sessionId: this.sessionId
        })
      );

      // 3. Actualizamos el signal con la respuesta del backend de forma reactiva
      this.mensajesSignal.update(mensajes => [
        ...mensajes,
        { emisor: 'ia', texto: res.respuesta }
      ]);

    } catch (error) {
      console.error('Error en la comunicación con el bot:', error);
      this.mensajesSignal.update(mensajes => [
        ...mensajes,
        { emisor: 'ia', texto: 'Disculpame, tuve un problema al procesar tu consulta. ¿Me la repetís?' }
      ]);
    }
  }

  // Genera un identificador aleatorio temporal si no existe uno en la sesión actual
  private obtenerOGenerarSessionId(): string {
    let id = sessionStorage.getItem('chat_session_id');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('chat_session_id', id);
    }
    return id;
  }
}
