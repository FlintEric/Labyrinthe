import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild  } from '@angular/core';
import{ MazeService} from "../navbar/maze.service";
import { WebDrawService,SceneService, Hotkeys } from "./services";

@Component({
  selector: 'app-scene2d',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css'],
  providers:[WebDrawService, SceneService, MazeService, Hotkeys]
})
export class Scene2dComponent implements OnInit, AfterViewInit {

  @ViewChild('sceneCanvas')
  private canvas!: ElementRef<HTMLCanvasElement>;
  
  constructor(private drawSrv:WebDrawService, private scene:SceneService, private maze: MazeService, private hotkeys:Hotkeys) { }
  async ngAfterViewInit(): Promise<void> {
    if (!this.canvas) {
      alert("canvas not supplied! cannot bind WebGL context!");
      return;
    }
    this.drawSrv.initialiseContext(this.canvas.nativeElement);
    this.scene.initialiseContext(this.drawSrv, this.maze);
    this.scene.Draw();
  }

  ngOnInit() {
   

  }


}
