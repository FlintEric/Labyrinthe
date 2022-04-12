import { EventEmitter } from '@angular/core';
import { PersoHero, Personnage } from './Personnage';
import { ScoreObject } from './ScoreObject';

export class PersonnageEvent extends Event {
    public get Personnage(){ return this.perso;}
    constructor(private perso:Personnage, title:string){
        super(title);
    }
}

export class PersonnageMovedEvent extends PersonnageEvent {
    public get Direction(){ return this.direction; }
    constructor(perso:Personnage, private direction:string){
        super(perso,"personnage_moved");
        perso.Cell.Visited = true;
    }
}
export class HeroWinEvent extends PersonnageEvent {
    constructor(perso:PersoHero){
        super(perso, "hero_win");
    }
}

export class HeroLooseEvent extends PersonnageEvent {
    constructor(perso:PersoHero){
        super(perso, "hero_loose");
    }
}



export class AddScoreEvent extends PersonnageEvent {
    constructor(perso:Personnage, private model:ScoreObject){
        super(perso, "hero_scores");
    }

    public get Model():ScoreObject { return this.model; }
}


export class ModelEvents {

    private static _inst:ModelEvents;
    public static get Instance(){ if( !ModelEvents._inst){ModelEvents._inst = new ModelEvents();} return ModelEvents._inst; }

    private movementEmitter: EventEmitter<PersonnageMovedEvent>;
    private winEmitter:EventEmitter<HeroWinEvent|HeroLooseEvent>;
    private scoreEmitter:EventEmitter<AddScoreEvent>;

    private constructor(){
        this.movementEmitter = new EventEmitter();
        this.winEmitter = new EventEmitter(true);
        this.scoreEmitter = new EventEmitter(true);
        
    }

    public static get MovementEmitter(){ return ModelEvents.Instance.movementEmitter; }

    public static get WinEmitter(){ return ModelEvents.Instance.winEmitter; }

    public static get ScoreEmitter(){ return ModelEvents.Instance.scoreEmitter; }

   
    
}