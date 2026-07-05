import { Component, inject, signal, viewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from './chat-widget.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrls: ['./chat-widget.scss']
})
export class ChatWidgetComponent {
  public chatService = inject(ChatService);
  
  // Estado para abrir/cerrar la ventana del chat flotante
  isOpen = signal<boolean>(false);
  mensajeTemporal = signal<string>('');
  
  // Referencia al contenedor de mensajes para manejar el scroll automático
  private scrollContainer = viewChild<ElementRef>('scrollMe');

  constructor() {
    // Cada vez que el Signal de mensajes cambie, llevamos el scroll abajo de forma eficiente
    effect(() => {
      this.chatService.mensajesSignal(); // Registramos la dependencia reactiva
      setTimeout(() => this.autoScroll(), 50);
    });
  }

  toggleChat(): void {
    this.isOpen.update(state => !state);
  }

  async enviar(): Promise<void> {
    const txt = this.mensajeTemporal().trim();
    if (!txt) return;
    
    this.mensajeTemporal.set(''); // Limpiamos el input inmediatamente
    await this.chatService.enviarMensaje(txt);
  }

  private autoScroll(): void {
    const el = this.scrollContainer()?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
