import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormclientePage } from './formcliente.page';

const routes: Routes = [
  {
    path: '',
    component: FormclientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormclientePageRoutingModule {}
