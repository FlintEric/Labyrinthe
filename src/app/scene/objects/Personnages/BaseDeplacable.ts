import { BaseModel, Point2D, Rectangle2D } from '../BaseModel';
import { Vector3 } from 'three';

export abstract class BaseDeplacable extends BaseModel {

    
    private _orientation: Vector3;

    constructor(pt:Point2D, width:number, height:number){
        super();
        this.Bounds = new Rectangle2D(pt, width, height);  
        this._orientation = new Vector3();
    }

    public get Orientation(){ return this._orientation;}
    public set Orientation(value:Vector3){ this._orientation = value; }
}