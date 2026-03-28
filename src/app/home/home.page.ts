import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { CadastroEmpresaComponent } from '../components/cadastro-empresa/cadastro-empresa.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CadastroEmpresaComponent],
})
export class HomePage {
  constructor() {}
}
