import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  callModalOpen = false;
  toastMsg = '';

  constructor(private router: Router) {}

  goToMenu() {
    this.router.navigate(['/menu'], { queryParams: { modo: 'ver' } });
  }

  goToBuild() {
    this.router.navigate(['/menu'], { queryParams: { modo: 'armar' } });
  }

  openCallService() {
    this.callModalOpen = true;
  }

  mensaje(){
     alert("En contrucción")
  }

  closeCallService() {
    this.callModalOpen = false;
  }

  async confirmCallService() {
    this.callModalOpen = false;

    // TODO: aquí llamas tu servicio real
    // await this.service.callWaiter({ mesaId: 'X' });

    this.showToast('Aviso enviado ✅');
  }

  private showToast(msg: string) {
    this.toastMsg = msg;
    window.setTimeout(() => (this.toastMsg = ''), 2200);
  }
}