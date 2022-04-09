import { EventEmitter, Injectable } from '@angular/core';
import { WebGLService } from "./web-gl.service";
import { WebDrawService } from "./web-draw.service";
import { BaseModel, Point2D, ImageRessource, Point } from "../objects/BaseModel";
import { VMaze } from '../objects/Decors/VMaze';
import { MazeService } from "../../navbar/maze.service";
import { Hero } from '../objects/Personnages/Hero';
import { DisplayCoin } from '../objects/Manipulables/bonus/DisplayCoin';
import { AddScoreEvent, ModelEvents } from '../../models/ModelEvents';
import { PersoHero } from 'src/app/models';


@Injectable()
export class SceneService {

  private static _instance?: SceneService;

  public static get Instance() {
    if (!SceneService._instance) {
      SceneService._instance = new SceneService();
      SceneService._instance.callOnce();
    }
    return SceneService._instance;
  }

  private _models: BaseModel[] = [];

  public get Models() { return this._models; }

  private _drawService?: WebGLService | WebDrawService;
  public get DrawSrv(): WebGLService | WebDrawService | undefined { return this._drawService; }
  public set DrawSrv(value: WebGLService | WebDrawService | undefined) { this._drawService = value; }

  private _mazeService?: MazeService;
  public get MazeSrv() { return this._mazeService; }
  public set MazeSrv(value: MazeService | undefined) { this._mazeService = value; }
  private id: number;

  private heroNames: string[];
  private monsters: string[];
  private onceCalled: boolean = false;
  private scoreSummiter: any;

  
  constructor() {
    if (!SceneService._instance) { SceneService._instance = this; }
    this.id = Math.floor(Math.random() * 1000000);
    console.log("SceneService " + this.id);
    this.heroNames = []; this.monsters = [];
  }

  private callOnce() {
    if (!ImageRessource.LoadedImages || Object.keys(ImageRessource.LoadedImages)) {
      let path = "assets/images/ironman.png";
      new ImageRessource(path, "ironman");
      this.heroNames.push("ironman");

      path = "assets/images/spiderman.png";
      new ImageRessource(path, "spiderman");
      this.heroNames.push("spiderman");

      path = "assets/images/venom.png";
      new ImageRessource(path, "venom");
      this.monsters.push("venom");

      path = "assets/images/araignee_squelette.png";
      new ImageRessource(path, "araignee_squelette");
      this.monsters.push("araignee_squelette");

      new ImageRessource("assets/images/textures/sols/chemins.png", "floor", true);
      new ImageRessource("assets/images/textures/murs/stone-wall-texture-tileable.jpg", "wall", true);


    }


    this.onceCalled = true;
  }

  async initialiseContext(drawService: WebGLService | WebDrawService, mazeService: MazeService) {
    const that = SceneService.Instance;
    if (!that.onceCalled) that.callOnce();
    console.log("InitializeContext");
    
      that.DrawSrv = drawService;
      that.MazeSrv = mazeService;
    
      await that.initialize();
    
  }

  async initialize() {
    const that = SceneService.Instance;
    if (!that.DrawSrv) { console.error("Initialize Context first"); return; }
    let mod: "2D" | "3D" = (that.DrawSrv instanceof WebDrawService) ? "2D" : "3D";
    console.log(`Initializing  ${mod}`);
    
    if (!that.currentMaze) {
      console.log("Pas de labyrinthe => Création");
      that.ComputeMaze();
    } else {
      if (that.MazeSrv && that.MazeSrv.Maze && !that.currentMaze.Model.Equals(that.MazeSrv.Maze)) {
        console.log("Update du labyrinthe => Création");
        that.ComputeMaze();
      }
    }

    that.DrawSrv.clear();
    
    for (let model of that.Models) {
      switch (mod) {
        case "2D": model.Init2D(that.DrawSrv.Context as CanvasRenderingContext2D); break;
        case "3D": {          
          await model.Init3D(that.DrawSrv as WebGLService);
          requestAnimationFrame(that.Draw);
        } break;
      }
    }



  }

  async initializeAndDraw() {
    let that = SceneService.Instance;
    await that.initialize();
    that.Draw();
  }

  private currentMaze?: VMaze;
  private currentHero?: Hero;

  private options?: DisplayCoin[];
  private _instanceComptation: number = 0;
  public ComputeMaze() {
    let that = SceneService.Instance;
    that._instanceComptation++;
    let info = that._instanceComptation;
    that.ClearMaze();
    if (!that.MazeSrv) throw new Error("Initialize Maze Service first");
    // Suppression du hero existant
    if (that.currentHero) that.RemoveModel(that.currentHero);

    // Suppression du maze existant
    if (that.currentMaze) {
      that.RemoveModel(that.currentMaze);
    }
    if (that.MazeSrv.Maze) {
      that.currentMaze = new VMaze(that.MazeSrv.Maze);
      // Ajout du maze
      that.AddModel(that.currentMaze);
      if (that.MazeSrv.Hero) {
        that.currentHero = new Hero(that.MazeSrv.Hero, that.currentMaze, ImageRessource.LoadedImages[that.heroNames[Math.floor(Math.random() * 1000) % that.heroNames.length]]);
        that.AddModel(that.currentHero);
      }

      if (that.MazeSrv.Options) {
        that.options = [];
        for (let coin of that.MazeSrv.Options) {
          that.options.push(new DisplayCoin(coin, that.currentMaze));
          that.AddModel(that.options[that.options.length - 1]);
        }

        if( this.scoreSummiter){
          this.scoreSummiter.unsubscribe();
        }
        this.scoreSummiter = ModelEvents.ScoreEmitter.subscribe((evt: AddScoreEvent) => {

          let that = SceneService.Instance;
          if (info === that._instanceComptation) {
            let score = evt.ScoreAdd.Score;


            // suppression de l'option consommée
            if (that.options) {
              let index = -1;
              for (let i = 0; i < that.options.length; i++) {
                if (that.options[i].Model.Equals(evt.ScoreAdd)) {
                  index = i;
                  break;
                }
              }
              if (index > -1) {
                that.RemoveModel(that.options[index]);
                that.options?.splice(index, 1);
                // On a trouvé la cellule correspondante
                if (that.currentHero && that.currentHero.Model instanceof PersoHero) {
                  (that.currentHero.Model as PersoHero).AddScore(score);
                }
              }
            }
            that.MazeSrv?.RemoveOption(evt.ScoreAdd);
            console.log("Options:", that.MazeSrv?.Options);
            console.log("Models:", that._models);
          }
        });
        console.log("Options:", that.MazeSrv.Options);
        console.log("Models:", that._models);
      }
    }



  }

  AddModel(model: BaseModel): void {
    let that = SceneService.Instance;
    that._models.push(model);
  }

  RemoveModel(model: BaseModel): void {
    console.log(`Suppression de ${ model.id}`);
    
    let that = SceneService.Instance;
    let startLength = SceneService.Instance.Models.length;
    let toDeleteIndex = -1;
    for (let i = 0; i < that.Models.length; i++) {
      if (that.Models[i].Equals(model)) {
        toDeleteIndex = i;
        break;
      }
    }
    that._models.splice(toDeleteIndex, 1);
    if( that._models.length === startLength ) throw new Error(`Erreur lors de la suppression de ${model.id} (length identiques)`);
    if( SceneService.Instance.Models.length  === startLength ) throw new Error(`Erreur lors de la suppression de ${model.id} (length identiques 2)`);

    let mod: "2D" | "3D" = (that.DrawSrv instanceof WebDrawService) ? "2D" : "3D";
    if( mod === "3D" && model.mesh){
      (that.DrawSrv as WebGLService).Scene.remove(model.mesh);
    }
    // On s'assure que l'element est bien supprimé
    for(let m of  SceneService.Instance.Models){
      if( m.id === model.id) throw new Error("Erreur lors de la suppression de " + model.id + ": [" + SceneService.Instance.Models.map(m => m.id).join(', ') + "]");
    }
    model.dispose();
  }

  ClearMaze(): void {
    let that = SceneService.Instance;
    for(let m of that._models) m.dispose();
    that._models = [];
    that.options = [];
    that.currentHero = undefined;
    that.currentMaze = undefined;
    if (this.scoreSummiter) {
      this.scoreSummiter.unsubscribe();
    }
  }

  Draw(): void {
    let redraw = () => {
      if (!ImageRessource.AllLoaded) {
        setTimeout(redraw, 100);
      } else {
        let that = SceneService.Instance;
        if (that._drawService) {
          //console.log(`Drawing Scene: ${that.Models.length} Models`)
          that._drawService.Draw(that.Models);
         
        }
        else throw new Error("initialiseContext First");
      }
    };
    redraw();
  }

}
