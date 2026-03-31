import { Component, OnInit, inject, Input } from '@angular/core'; // 1. Corrigido: 'Input' com I maiúsculo
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

// --- IMPORTAÇÃO DOS ÍCONES (O que estava faltando) ---
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  cloudUploadOutline, 
  trashOutline, 
  addOutline, 
  chevronDownOutline 
} from 'ionicons/icons';

// Firebase
import { Firestore, collection, addDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-cadastro-empresa',
  templateUrl: './cadastro-empresa.component.html',
  styleUrls: ['./cadastro-empresa.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ]
})
export class CadastroEmpresaComponent implements OnInit {
  @Input() empresaEditar: any; 

  private modalCtrl = inject(ModalController);
  private fb = inject(FormBuilder);
  private firestore = inject(Firestore);
  private storage = inject(Storage);

  empresaForm!: FormGroup;
  logoPreview: string | null = null;
  isEditMode = false; // Controla o título da página

  constructor() {
    // Ícones registrados para que funcionem no modo Standalone
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'cloud-upload-outline': cloudUploadOutline,
      'trash-outline': trashOutline,
      'add-outline': addOutline,
      'chevron-down-outline': chevronDownOutline
    });
    
    this.initForm();
  }

  ngOnInit() {
    console.log('Dados recebidos no Modal: ', this.empresaEditar)
    
    // Se existir empresaEditar, preenchemos o formulário
    if (this.empresaEditar) {
      this.isEditMode = true; // Ativa modo edição
      
      // Preenche campos simples
      this.empresaForm.patchValue(this.empresaEditar);

      // Preenche o logo
      this.logoPreview = this.empresaEditar.logoUrl;

      // Preenche os telefones (Array dinâmico)
      this.telefones.clear();
      if (this.empresaEditar.telefones && Array.isArray(this.empresaEditar.telefones)) {
        this.empresaEditar.telefones.forEach((tel: any) => {
          this.telefones.push(this.fb.group({
            rotulo: [tel.rotulo, Validators.required],
            numero: [tel.numero, Validators.required]
          }));
        });
      }
    } else {
      // Se for cadastro novo, começa com um campo vazio
      this.isEditMode = false;
      this.addTelefone();
    }
  }

  initForm() {
    this.empresaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cnpj: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      logoUrl: [''],
      telefones: this.fb.array([]),
      status: [true] // Mantemos o status como true por padrão
    });
  }

  get telefones() {
    return this.empresaForm.get('telefones') as FormArray;
  }

  addTelefone() {
    const telefoneGroup = this.fb.group({
      rotulo: ['Financeiro', Validators.required],
      numero: ['', Validators.required]
    });
    this.telefones.push(telefoneGroup);
  }

  removeTelefone(index: number) {
    this.telefones.removeAt(index);
  }

  async uploadLogo(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const filePath = `logos/${new Date().getTime()}_${file.name}`;
      const storageRef = ref(this.storage, filePath);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      this.logoPreview = url;
      this.empresaForm.patchValue({ logoUrl: url });
    } catch (error) {
      console.error('Erro ao fazer upload do logo', error);
    }
  }

  async salvar() {
    if (this.empresaForm.valid) {
      try {
        const dadosEmpresa = this.empresaForm.value;

        if (this.isEditMode && this.empresaEditar?.id) {
          // --- MODO EDITAR ---
          const docRef = doc(this.firestore, `empresas/${this.empresaEditar.id}`);
          await updateDoc(docRef, dadosEmpresa);
          console.log('Empresa atualizada com sucesso');
        } else {
          // --- MODO CADASTRO ---
          const empresaRef = collection(this.firestore, 'empresas');
          await addDoc(empresaRef, dadosEmpresa);
          console.log('Empresa cadastrada com sucesso!');
        }

        // Fecha o modal e avisa a lista que houve alteração
        this.modalCtrl.dismiss(true);
      } catch (error) {
        console.error('Erro ao salvar no banco', error);
      }
    }
  }

  // Função para fechar sem salvar (útil para o botão cancelar do modal)
  fechar() {
    this.modalCtrl.dismiss();
  }
}