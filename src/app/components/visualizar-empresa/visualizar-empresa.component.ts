import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  callOutline, 
  businessOutline, 
  mailOutline, 
  createOutline, 
  closeOutline,
  copyOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-visualizar-empresa',
  templateUrl: './visualizar-empresa.component.html',
  styleUrls: ['./visualizar-empresa.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class VisualizarEmpresaComponent {
  @Input() empresa: any; // Recebe os dados da lista
  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({
      'call-outline': callOutline,
      'business-outline': businessOutline,
      'mail-outline': mailOutline,
      'create-outline': createOutline,
      'close-outline': closeOutline,
      'copy-outline': copyOutline
    });
  }

  fechar() {
    this.modalCtrl.dismiss();
  }

  irParaEditar() {
    // Fecha este modal e avisa a página pai para abrir o de edição
    this.modalCtrl.dismiss({ edit: true });
  }
}