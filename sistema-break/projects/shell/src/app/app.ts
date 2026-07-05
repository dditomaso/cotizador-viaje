import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatWidgetComponent } from '../../components/chat-widget/chat-widget';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatWidgetComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('shell');
}
