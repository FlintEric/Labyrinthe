import { AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MazeService } from '../navbar/maze.service';
import { WebGLService, SceneService} from "./services";

@Component({
  selector: 'app-scene3d',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css'],
  providers:[WebGLService, SceneService, MazeService]
})
export class Scene3dComponent implements OnInit, AfterViewInit {
  @ViewChild('sceneCanvas') private canvas!: ElementRef<HTMLCanvasElement>;

  constructor(private webGl:WebGLService, private scene:SceneService, private maze:MazeService, private mapGl: WebGLService) { }

  async ngAfterViewInit(): Promise<void> {
    if (!this.canvas) {
      alert("canvas not supplied! cannot bind WebGL context!");
      return;
    }
    
    this.webGl.initialiseWebGLContext(this.canvas.nativeElement);
    
    this.scene.initialiseContext(this.webGl, this.maze);
    
    this.scene.Draw();
  }

  ngOnInit() {
  }

}
