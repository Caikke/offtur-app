import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-cadastro-sistema',
  templateUrl: './cadastro-sistema.component.html',
  styleUrls: ['./cadastro-sistema.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class CadastroSistemaComponent  implements OnInit {
  private fb = inject(FormBuilder);
  private firestore= inject(Firestore);
  private toastCtrl = inject(ToastController);
  
  sistemaForm: FormGroup;

  constructor() {
    this.sistemaForm = this.fb.group({
      nome: ['', [Validators.required]],
      tipo: ['calculado', Validators.required], // Calculado ou Manual
      campos: this.fb.array([]) // Nome dos campos que o funcionário vai preencher
   });
  }

  ngOnInit() {}

  // Helper para o Array de Campos
  get campos() {
    return this.sistemaForm.get('campos') as FormArray;
  }

  addCampo() {
    const campoGroup = this.fb.group({
      nome:['', Validators.required],
      operacao: ['soma', Validators.required]
    });
    this.campos.push(campoGroup);
  }

  removeCampo(index: number) {
    this.campos.removeAt(index);
  }

  async salvar() {
    if (this.sistemaForm.valid) {
      const novaRegra = this.sistemaForm.value;
      const regrasRef = collection(this.firestore, 'regras-sistemas');
      
      await addDoc(regrasRef, novaRegra);
      
      const toast = await this.toastCtrl.create({
        message: 'Regra de sistema cadastrada!',
        duration: 2000,
        color: 'success'
      });
      toast.present();
      this.sistemaForm.reset({ tipo: 'calculado', operacao: 'subtracao' });
      this.campos.clear();
    }
  }


}
