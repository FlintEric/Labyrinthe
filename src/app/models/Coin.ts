import { Cell } from ".";
import { AddScoreEvent, ModelEvents, PersonnageMovedEvent} from './ModelEvents';

export class Coin {

    public get Cell(){ return this.cell;}   
    public get Score(){ return this.score; }
    private emitter:any;
    constructor(private cell:Cell, private score:number = 1){
        let that = this;
        this.emitter = ModelEvents.MovementEmitter.subscribe(function(evt:PersonnageMovedEvent){
            if( evt.Personnage.Cell.Equals(cell)){
                ModelEvents.ScoreEmitter.emit(new AddScoreEvent(evt.Personnage, that))
            }
        });
    }

    public Equals(other:Coin):boolean{
        if( this.cell.Equals(other.cell)){
            if( this.Score === other.Score) return true;
        }
        return false;
    }

    public equals(other:Coin):boolean{ return this.Equals(other);}
}