import { Injectable } from '@angular/core';
import { Cell, Maze, Personnage, PersoHero, ModelEvents, Coin, Letter, ScoreObject } from "../models";

@Injectable()
export class MazeService {
  public static DEFAULT_COLUMNS = 5;
  public static DEFAULT_LINES = 5;
  private currentMaze?: Maze;
  private hero?: Personnage;
  private enemies: Personnage[];
  private options: (Coin | Letter)[];
  private word?:string;


  private static _instance: MazeService;
  public get Instance() { if (!MazeService._instance) MazeService._instance = new MazeService(); return MazeService._instance; }

  public get Maze(): Maze | undefined {
    return MazeService._instance.currentMaze;
  }

  public get Hero(): Personnage | undefined {
    return MazeService._instance.hero;
  }

  public get Enemies(): Personnage[] { return MazeService._instance.enemies; }
  public get Options(): (ScoreObject)[] { return MazeService._instance.options; }

  public RemoveOption(coin: ScoreObject) {
    let ind = -1;
    for (let i = 0; i < this.Options.length; i++) {
        if (this.Options[i].Equals(coin)) {
          ind = i;
          MazeService._instance.options[i].unsubscribe();
          break;
        }
    }
    if (ind > -1) {
      MazeService._instance.options.splice(ind, 1);
    }
  }

  public get Start(): Cell | undefined {
    if (this.Maze) {
      return this.Maze.Start;
    }
    return undefined;
  }

  public get End(): Cell | undefined {
    if (this.Maze) {
      return this.Maze.End;
    }
    return undefined;
  }

  constructor() {
    this.enemies = [];
    this.options = [];
    if (!MazeService._instance) {
      MazeService._instance = this;
      this.GenerateMaze(MazeService.DEFAULT_COLUMNS, MazeService.DEFAULT_LINES);
    }

  }

  public GenerateMaze(columns: number, lines: number, word?: string): Promise<Maze> {

    console.log(`Generation d'un labyrinthe de ${columns}x${lines}`);
    if (columns <= 1 || lines <= 1) { throw new Error(`Impossible de générer un labyrinthe avec les dimensions fournies (${columns}x${lines})`); }

    let that = this;
    return new Promise<Maze>((resolve, reject) => {
      MazeService._instance.currentMaze = new Maze(columns, lines);
      // Création du labyrinthe
      if (that.Maze) {
        that.Maze.Generate();
        if( that.options ){
          for( let o of that.options){
            o.unsubscribe();
          }
        }
        that.options = [];

        // Initialisation des options
        let max = that.Maze?.Columns | 0;
        if (max < that.Maze?.Lines) max = that.Maze?.Lines | 0;
        if (word) { 
          max = word.length; 
          that.word = word;
        }
        let used: String[] = [];

        for (let i = 0; i < max; i++) {
          // Déterminsation de la posiution de la Cellule
          let c: Cell;
          let isused = false;
          do {
            isused = false;
            c = that.Maze.Cellules[Math.floor(Math.random() * 1000) % that.Maze.Cellules.length][Math.floor(Math.random() * 1000) % that.Maze.Cellules[0].length];
            if (that.Maze.Start?.Equals(c) || that.Maze.End?.Equals(c)) isused = true;
            if (!isused && used.indexOf(c.Id) > -1) isused = true;

          } while (isused);
          used.push(c.Id);
          if( !word)
            that.options.push(new Coin(c));
          else 
            that.options.push(new Letter(c, word[i]));
        }

      }
      // Initialisation du hero
      if (that.Start) {
        that.hero = new PersoHero(that.Start, this.word);
      }


      if( this.word) console.log(`Word: ${this.word}`);
      resolve(MazeService._instance.currentMaze);
    });
  }



}
