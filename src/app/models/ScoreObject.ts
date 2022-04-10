import { Cell } from "./Maze";
import { AddScoreEvent, ModelEvents, PersonnageMovedEvent} from './ModelEvents';

export abstract class  ScoreObject{

    public get Cell(){ return this.cell;}    
    private emitter:any;

    public get Score(){ return this._score; }

    constructor(private cell:Cell, private _score:number = 1){
        let that = this;
        this.emitter = ModelEvents.MovementEmitter.subscribe(function(evt:PersonnageMovedEvent){
            if( evt.Personnage.Cell.Equals(cell)){
                ModelEvents.ScoreEmitter.emit(new AddScoreEvent(evt.Personnage, that))
            }
        });
    }

    public Equals(other:any):boolean{
        if( other && other instanceof ScoreObject)
            if( this.cell.Equals(other.cell)){
                if( this.doEqual(other)) return true;
            }
        return false;
    }

    public equals(other:any):boolean{ return this.Equals(other);}

    public abstract doEqual(other:ScoreObject):boolean;

    public unsubscribe(){
        if( this.emitter ){
            this.emitter.unsubscribe();
            this.emitter=undefined;
        }
    }
}