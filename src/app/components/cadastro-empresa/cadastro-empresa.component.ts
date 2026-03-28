import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import{
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

//Firebase
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import {Storage, ref, uploadBytes, getDownloadURL} from '@angular/fire/storage';

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
export class CadastroEmpresaComponent  implements OnInit {
  //Injeção de dependências
  private fb = inject(FormBuilder);
  private firestore = inject(Firestore);
  private storage = inject(Storage);

  empresaForm!: FormGroup;
  logoPreview: string | null = null;

  constructor() { 
    this.initForm();
   }

  ngOnInit() {
    // Se quiser que já comece com um campo de telefone vazio:
    this.addTelefone();
  }

  // 1. Inicializa o formulário estruturado
  initForm() {
    this.empresaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cnpj: ['',[Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      logoUrl: [''], //Aqui guardo o link final da imagem
      telefones: this.fb.array([]), // Array dinâmico de telefones
      status: [true]
    });
  }

  // 2. Helpers para o FormArray (Telefones)
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

  // 3. Lógica de Upload do Logo para o Firebase Storage
  async uploadLogo(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Cria um caminho único para a imagem
      const filePath = `logos/${new Date().getTime()}_${file.name}`;
      const storageRef = ref(this.storage, filePath);

      // Faz o upload
      const snapshot = await uploadBytes(storageRef, file);

      // Pega a URL pública da imagem
      const url = await getDownloadURL(snapshot.ref);

      this.logoPreview = url; // Mostra a foto no círculo
      this.empresaForm.patchValue({ logoUrl: url }); // Salva a URL no formulário
    } catch (error) {
      console.error('Erro ao fazer upload do logo', error)
    }
  }

  // 4. Salvar os dados no Firestore
  async salvar() {
    if (this.empresaForm.valid) {
      try {
        const dadosEmpresa = this.empresaForm.value;
        const empresaRef = collection(this.firestore, 'empresas');

        await addDoc(empresaRef, dadosEmpresa);

        console.log('Empresa Cadastrada com sucesso!');
        this.resetarFormulario();
      } catch (error) {
        console.error('Erro ao salvar no banco', error);
      }
    }
  }

  resetarFormulario() {
    this.empresaForm.reset({ status:true });
    this.telefones.clear();
    this.addTelefone();
    this.logoPreview = null;
  }

}
