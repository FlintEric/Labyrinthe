import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Scene2dComponent} from './scene/scene2d.component';
import { Scene3dComponent} from './scene/scene3d.component';

const routes:Routes = [
  { path:"2D", component:Scene2dComponent},
  { path:"3D", component:Scene3dComponent },
  { path: "", redirectTo:"2D", pathMatch:"full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
