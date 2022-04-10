import { Cell } from '.';
import { ModelEvents, PersonnageMovedEvent, HeroWinEvent } from './ModelEvents';

export class Personnage {

    private needToMove:boolean =false;
    constructor(private name:string, private currentCell:Cell){}

    public get Name(){ return this.name; }

    public get Cell(){ return this.currentCell; }

    public set NeedToMove(value:boolean){this.needToMove=value;}
    public get NeedToMove(){ return this.needToMove;}

    protected Moved(){
        ModelEvents.MovementEmitter.emit(new PersonnageMovedEvent(this));
        this.NeedToMove=true;
    }


    public MoveUp(){
        if( !this.Cell.Murs[1] && this.Cell.Top) { // Il n'y a pas de mur et il y a une cellule en haut
            this.currentCell = this.Cell.Top;
            this.Moved();
        }
    }

    public MoveLeft(){
        if( !this.Cell.Murs[0] && this.Cell.Left){
            this.currentCell = this.Cell.Left;
            this.Moved();
        }
    }

    public MoveRight(){
        if( !this.Cell.Murs[2] && this.Cell.Right){
            this.currentCell = this.Cell.Right;
            this.Moved();
        }
    }

    public MoveDown(){
        if( !this.Cell.Murs[3] && this.Cell.Bottom){
            this.currentCell = this.Cell.Bottom;
            this.Moved();
        }
    }

    public Equals(other:Personnage):boolean{
        if( this.Name === other.Name){
            if( this.Cell.Equals(other.Cell)) 
                return true;
        }
        return false;
    }
}

export class PersoHero extends Personnage {
    private _score:number;
    
public get Word(){ return this.word;}
    constructor(cell:Cell, private word?:string){
        super("hero", cell);
        console.log(`Hero to ${cell.Id}`);
        this._score = 0;
    }

    public get Score(){ return this._score; }

    protected Moved(){
        super.Moved();
        if( this.Cell.isEnd){
            ModelEvents.WinEmitter.emit(new HeroWinEvent(this));
        }
    }

    public Equals(other:Personnage): boolean{
        if( other instanceof PersoHero){
            return super.Equals(other);
        }
        return false;
    }

    public AddScore(value:number){
        this._score += value;
    }


}