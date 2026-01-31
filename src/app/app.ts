import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from "./components/nav-component/nav-component";
import { FooterComponent } from "./components/footer-component/footer-component";
import { AuthService } from './api/auth-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('smart-menu-front');

  //constructor(private auth: AuthService) {
  //this.auth.setCredentials('empresa@logistica.com', '1234');
}

