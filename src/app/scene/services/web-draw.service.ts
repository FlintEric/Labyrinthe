import { Injectable } from '@angular/core';
import { BaseModel } from '../objects';

export interface Clearable {
  clear(): void;
}
@Injectable()
export class WebDrawService implements Clearable{

  private _renderingContext: any;

  private get ctx():CanvasRenderingContext2D{
    return this._renderingContext as CanvasRenderingContext2D;
  }
  public get Context(){ return this.ctx; }
  constructor() { }
  
  initialiseContext(canvas:HTMLCanvasElement){
    this._renderingContext = canvas.getContext('2d');
    if( !this.ctx){
      alert("Unable to initialize 2d Context.");
      return;
    }
    this.setWebCanvasDimensions(canvas);
  }

  setWebCanvasDimensions(canvas:HTMLCanvasElement){
    // Récupération des dimensions de l'écran
    let maxWidth = window.innerWidth;
    let maxHeigth = window.innerHeight - 64;
    let ratioMax = maxWidth;
    if( maxWidth > maxHeigth) ratioMax = maxHeigth;
    if( ratioMax === 0){
      this.ctx.canvas.width = canvas.clientWidth;
      this.ctx.canvas.height = canvas.clientHeight;
    }
    else{
      this.ctx.canvas.width = ratioMax;
      this.ctx.canvas.height = ratioMax;
    }
    //console.log(this.ctx.canvas);
  }

  Draw(models:BaseModel []){
    for(let m of models){
      m.Draw2D(this.ctx);
    }
  }

  clear(){
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }
}
