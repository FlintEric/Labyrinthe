import { Coin, Letter, ScoreObject } from "src/app/models";
import { WebGLService } from "src/app/scene/services";
import { Point, Point2D } from "../../BaseModel";
import { VMaze } from "../../Decors/VMaze";
import { BaseBonus } from "./BaseBonus";
//import * as THREE from "three";
import { MeshFactory } from "../../MeshFactory";


export class DisplayCoin extends BaseBonus {

    public get Model():ScoreObject { return this.coin; }

    constructor(private coin:ScoreObject, private maze: VMaze) {
        super(new Point2D(0, 0),
            maze.TileWidth - 10, maze.TileHeight - 10);
    }

    public Init3D(gl: WebGLService): void {
        let tile = this.maze.GetTile(this.coin.Cell);
        if (tile) {
            if( this.Model instanceof Coin){                
                this.mesh = MeshFactory.Create3DCoin(this.Model as Coin);
            }
            else{
                this.mesh = MeshFactory.Create3DLetter(this.Model as Letter);
            }
            if( this.mesh){
                this.mesh.position.x = tile.Bounds.Location.X ;
                this.mesh.position.y = tile.Bounds.Location.Y;
                this.mesh.position.z = 5;
                this.mesh.rotateZ(Math.PI/4 );
                gl.Scene.add(this.mesh);
            }
            /*tile.Bounds.Location.X + 5, tile.Bounds.Location.Y + 5
            this.Bounds.Width = tile.Bounds.Width - 10;
            this.Bounds.Height = tile.Bounds.Height - 10;
            */
        }

    }
    public Init2D(ctx: CanvasRenderingContext2D): void {
        let tile = this.maze.GetTile(this.coin.Cell);
        if (tile) {
            this.Bounds.Location = new Point2D(tile.Bounds.Location.X + 5, tile.Bounds.Location.Y + 5);
            this.Bounds.Width = tile.Bounds.Width - 10;
            this.Bounds.Height = tile.Bounds.Height - 10;
        }

    }
    public Draw3D(gl: WebGLService): void {

        if( this.mesh ){
            //console.log(`Rotation de ${ this.id }`);
            const r = Date.now() % 60 / 80 ;
            if( this.mesh instanceof Coin)
                this.mesh.rotateZ( r / (2*Math.PI));
            
        }else{
            console.log(`Pas de mesh à faire pivoter pour ${ this.id }`);
        }

    }

    public Draw2D(ctx: CanvasRenderingContext2D): void {

        // Calcul

        let centerX = this.Bounds.X + (this.Bounds.Width / 2);
        let centerY = this.Bounds.Y + (this.Bounds.Height / 2);
        if( this.Model instanceof Coin){
                    
            let radius = this.Bounds.Height / 4;
            //console.log(`Coin: ${centerX},${centerY}, ${radius} => ${this.Model.Cell}`);
            ctx.beginPath();
            ctx.fillStyle = "#eed30d";
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#003300";
            ctx.stroke();
        }
        else if( this.Model instanceof Letter){
            let oldFont = ctx.font;            
            let height = Math.floor(Math.min(this.Bounds.Width, this.Bounds.Height));
            ctx.font = `${height}px helvetica`;
            ctx.textAlign = 'start';
            ctx.textBaseline = 'top';
            let text = ctx.measureText(this.Model.Letter);
            let targetX = centerX - (text.width/2);
            let targetY = this.Bounds.Top + (this.Bounds.Height - height) + 10;
            ctx.fillStyle = "#eed30d";
            ctx.fillText(this.Model.Letter, targetX , targetY);
            //console.log(`Letter: ${this.Model.Letter} :${text} ${targetX}, ${targetY} => ${this.Model.Cell}`);
            ctx.font = oldFont;
            
        }
        /*
                ctx.strokeStyle = "#000000";
                ctx.beginPath();
                ctx.arc(75, 75, 50, 0, Math.PI * 2, true);  // Cercle extérieur
                ctx.moveTo(110,75);
                ctx.arc(75, 75, 35, 0, Math.PI, false);  // Bouche (sens horaire)
                ctx.moveTo(65, 65);
                ctx.arc(60, 65, 5, 0, Math.PI * 2, true);  // Oeil gauche
                ctx.moveTo(95, 65);
                ctx.arc(90, 65, 5, 0, Math.PI * 2, true);  // Oeil droite
                ctx.stroke();
                */
    }

}