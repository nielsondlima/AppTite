import { Component } from '@angular/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  nutricionistas = [
    {
      nome: 'Dra. Ana Paula',
      especialidade: 'Nutrição Esportiva',
      descricao: 'Especialista em performance e emagrecimento saudável.',
      foto: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      nome: 'Dr. João Silva',
      especialidade: 'Nutrição Clínica',
      descricao: 'Atendimento personalizado para todas as idades.',
      foto: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      nome: 'Dra. Camila Souza',
      especialidade: 'Nutrição Funcional',
      descricao: 'Foco em saúde intestinal e bem-estar.',
      foto: 'https://randomuser.me/api/portraits/women/65.jpg'
    }
  ];

  constructor() {}

}
