import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-formcliente',
  templateUrl: './formcliente.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class FormclientePage {
  // Propriedade para limitar o input de data ao dia atual
  hoje: string = new Date().toISOString().split('T')[0];

  // Modelo do formulário
  form = {
    nome: '',
    email: '',
    nascimento: '',
    senha: '',
    confirmarSenha: '',
  };

  // Reseta todos os campos
  limpar() {
    this.form = { nome: '', email: '', nascimento: '', senha: '', confirmarSenha: '' };
  }

  // Envio do formulário
  onSubmit() {
    if (this.form.senha !== this.form.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    console.log('Dados do formulário:', this.form);
    alert('Cadastro realizado com sucesso!');
  }
}
