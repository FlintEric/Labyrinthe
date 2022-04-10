import { Cell } from "./Maze";
import { ScoreObject } from "./ScoreObject";

export class Letter extends ScoreObject {
    public get Letter():string { return this._letter;}
        
    constructor(cell:Cell, private _letter:string){
        super(cell);
        console.log(`Adding Letter ${this._letter} to ${cell.Id}`);
    }

    public doEqual(other:ScoreObject):boolean{
        if( other && other instanceof Letter && this._letter === (other as Letter)._letter) return true;           
        return false;
    }


}
