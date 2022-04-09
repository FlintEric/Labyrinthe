import { BaseTile } from '../BaseTile';

export abstract class BaseDecor extends BaseTile {
    private _subTiles: BaseTile[];
    constructor(){
        super();
        this._subTiles=[];
    }

    public get SubTiles(){ return this._subTiles; }
    //public set SubTiles(value:BaseTile[]){ this._subTiles=value;}
    public AddTile(tile:BaseTile){
        this._subTiles.push(tile);
        super.SubModels.push(tile);
    }

}