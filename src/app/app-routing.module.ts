import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CallComponent } from './call/call.component';
import { MessageComponent } from './message/message.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'call', component: CallComponent },
  { path: 'chat', component: MessageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
