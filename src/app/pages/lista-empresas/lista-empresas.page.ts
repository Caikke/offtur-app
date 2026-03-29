import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
// Adicionado 'where' para filtrar e 'doc/updateDoc' para desativar
import { Firestore, collection, collectionData, query, orderBy, doc, updateDoc, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CadastroEmpresaComponent } from 'src/app/components/cadastro-empresa/cadastro-empresa.component';

@Component({
  selector: 'app-lista-empresas',
  templateUrl: './lista-empresas.page.html',
  styleUrls: ['./lista-empresas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ListaEmpresasPage implements OnInit {
  private firestore = inject(Firestore);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  // O "$" no final é uma convenção para dizer que é um "Stream" de dados (Observable)
  empresas$!: Observable<any[]>;

  constructor() { }

  ngOnInit() {
    // 1. Referência para a coleção que foi criada no Firebase
    const empresaRef = collection(this.firestore, 'empresas');

    // 2. Consulta ordenada por nome e filtrando apenas as ATIVAS (status: true)
    const q = query(
      empresaRef, 
      where('status', '==', true), // Garante que empresas desativadas sumam da lista
      orderBy('nome', 'asc')
    );

    // 3. O collectionData traz os dados em tempo real
    // O idField: 'id' serve para o Firebase colocar o ID do documento dentro do objeto
    this.empresas$ = collectionData(q, {idField: 'id'});
  }

  // Função para abrir o cadastro (Novo/Vazio)
  async abrirCadastro() {
      const modal = await this.modalCtrl.create({
        component: CadastroEmpresaComponent
    });
    return await modal.present();
  }

  // NOVA: Função para abrir o cadastro preenchido para edição
  async editarEmpresa(empresa: any) {
    const modal = await this.modalCtrl.create({
      component: CadastroEmpresaComponent,
      componentProps: {
        // Passa a empresa clicada para o @Input do componente de cadastro
        empresaEditar: empresa 
      }
    });
    return await modal.present();
  }

  // Função para desativar a empresa (Soft Delete)
  async desativarEmpresa(empresa: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Desativação', // Alterado de Exclusão para Desativação
      message: `Deseja realmente desativar a empresa ${empresa.nome}? Ela não aparecerá mais para registros futuros.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Desativar',
          role: 'destructive',
          handler: async () => {
            const docRef = doc(this.firestore, `empresas/${empresa.id}`);
            // Apenas altera o campo status para desativado (Integridade de dados!)
            await updateDoc(docRef, { status: false });
            console.log('Empresa desativada com sucesso!');
          }
        }
      ]
    });

    // IMPORTANTE: Necessário para o alerta aparecer
    await alert.present();
  }

}