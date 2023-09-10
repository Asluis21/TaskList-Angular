import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskComponent } from './task/task.component';
import { TaskFormComponent } from './task-form/task-form.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  {path:'', redirectTo: '/task', pathMatch:'full'},
  {path:'task', component: TaskComponent, data : {state:"task"}},
  {path:'task/:page', component: TaskComponent, data : {state:"task"}},
  {path:'overdue/:page', component: TaskComponent, data : {state:"overdue"}},
  {path:'pending/:page', component: TaskComponent, data : {state:"pending"}},
  {path:'complete/:page', component: TaskComponent, data : {state:"complete"}},
  {path:'create', component: TaskFormComponent, data : {editMode : false}},
  {path:'task/ver/:id', component: TaskFormComponent, data : {editMode : true}},
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
