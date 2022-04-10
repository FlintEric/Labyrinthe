import { Cell } from "./Maze";
import { ScoreObject } from "./ScoreObject";

export class Coin extends ScoreObject{
   
    constructor( cell:Cell, score:number = 1){
        super(cell, score);
        console.log(`Adding Coin to ${cell.Id}`);
    }

    public doEqual(other:ScoreObject):boolean{
        if( other && other instanceof Coin && this.Score === (other as Coin).Score) return true;
        return false;
    }
}