import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-main',
  imports: [ButtonModule, RouterLink],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {

}
