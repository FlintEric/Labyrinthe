import { ModelEvents, PersoHero, Personnage, PersonnageMovedEvent } from 'src/app/models';
import { MiniMapView, WebGLService } from '../../services/web-gl.service';
import { Color, Rectangle2D, Point2D, ImageRessource } from '../BaseModel';
import { VMaze } from '../Decors/VMaze';
import { BaseDeplacable } from './BaseDeplacable';
import { Wall } from "../Decors/Wall";
import * as THREE from "three";
import { Subscription } from 'rxjs';
import { MeshFactory } from '../MeshFactory';
import { HttpClientXsrfModule } from '@angular/common/http';

export class Hero extends BaseDeplacable {

    private image: HTMLImageElement | undefined;

    constructor(private _model: Personnage, private maze: VMaze, private texture?: Color | ImageRessource) {
        super(maze.Start ? maze.Start.Bounds.Location : new Point2D(0, 0),
            maze.Start ? maze.Start.Bounds.Width - 4 : maze.TileWidth - 4, maze.Start ? maze.Start.Bounds.Height - 4 : maze.TileHeight - 4);


    }

    public get Maze():VMaze{ return this.maze;}

    public get Texture(){ return this.texture;}
    

    public get Model() { return this._model; }
    public set Model(value: Personnage) { this._model = value; }
    private mouvementEmitter?: Subscription;

    public Init3D(gl: WebGLService): void {
        let that = this;
        if (this.texture && this.texture instanceof ImageRessource && !this.texture.isLoaded) {
            let that = this;
            setTimeout(function () { that.Init3D(gl); }, 10);
            return;
        }

        if( this.mouvementEmitter) this.mouvementEmitter.unsubscribe();
        this.mouvementEmitter = ModelEvents.MovementEmitter.subscribe(function (_event: PersonnageMovedEvent) {

            if (_event.Personnage.Equals(that.Model)) {
                that.move3D(gl);
            }
        });


        // Ajout d'une forme pour représenter le hero (le temps qu'on passe a la 1ere personne)

        //let geometry = new THREE.BoxGeometry(this.Bounds.Width - 10, this.Bounds.Height - 10, this.maze.TileDepth - 20, 1, 1, 1);
        
        this.mesh = MeshFactory.CreateHero(this);
        gl.Scene.add(this.mesh);


        this.move3D(gl);
    }

    public move3D(gl: WebGLService) {
        let target = this.maze.GetTile(this._model.Cell);
        if (target) {
            let cdeep = 100;

            for (let v of gl.Views) {
                if (v instanceof MiniMapView) {
                    v.Camera.position.set(
                        (target.Bounds.Left) + (target.Bounds.Width / 2),
                        (target.Bounds.Top) + (target.Bounds.Height / 2),
                        cdeep + 200);
                    v.Camera.lookAt((target.Bounds.Left) + (target.Bounds.Width / 2),
                        (target.Bounds.Top) + (target.Bounds.Height / 2),
                        -cdeep);
                }
                else {
                    v.Camera.position.set(
                        (target.Bounds.Left),
                        (target.Bounds.Top),
                        10);
                  /*  v.Camera.lookAt( (target.Bounds.Right) + 500,
                    (target.Bounds.Bottom),
                    10);

                    if (target.Orientation) {
                        switch (target.Orientation) {
                            case "left":
                                v.Camera.lookAt(target.Bounds.Left - 500, (target.Bounds.Top) + (target.Bounds.Height / 2), 10);
                                break;
                            case "right":
                                v.Camera.lookAt(target.Bounds.Right + 500, (target.Bounds.Top) + (target.Bounds.Height / 2), 10);
                                break;
                            case "up":
                                v.Camera.lookAt((target.Bounds.Left) + (target.Bounds.Width / 2), (target.Bounds.Bottom) + 500, 10);
                                break;
                            case "down":
                                v.Camera.lookAt((target.Bounds.Left) + (target.Bounds.Width / 2), (target.Bounds.Top) - 500, 10);
                                break;
                        }
                        
                    }*/
                }
            }
            if (target.Orientation) {
                switch (target.Orientation) {
                    case "left":
                        if( gl.Control )gl.Control.lookAt(target.Bounds.Left - 500, (target.Bounds.Top) + (target.Bounds.Height / 2), 10);
                        break;
                    case "right":
                        if( gl.Control )gl.Control.lookAt(target.Bounds.Right + 500, (target.Bounds.Top) + (target.Bounds.Height / 2), 10);
                        break;
                    case "up":
                        if( gl.Control )gl.Control.lookAt((target.Bounds.Left) + (target.Bounds.Width / 2), (target.Bounds.Bottom) + 500, 10);
                        break;
                    case "down":
                        if( gl.Control )gl.Control.lookAt((target.Bounds.Left) + (target.Bounds.Width / 2), (target.Bounds.Top) - 500, 10);
                        break;
                }
                
            }
            
            //gl.Camera.lookAt(this.Orientation);
            //gl.Camera.updateProjectionMatrix();
            this.Model.NeedToMove = false;
            // console.log("3D Hero moved", gl.Camera);
            if (this.mesh) {
                this.mesh.position.x = target.Bounds.X;
                this.mesh.position.y = target.Bounds.Y;
                if (target.Orientation) {
                    switch (target.Orientation) {
                        case "up":
                            this.mesh.lookAt(this.mesh.position.x, this.mesh.position.y + 500);
                             break;
                        case "left":
                            this.mesh.lookAt(this.mesh.position.x - 500, this.mesh.position.y);
                             break;
                        case "down":
                            this.mesh.lookAt(this.mesh.position.x, this.mesh.position.y + 500);
                             break;
                        case "right":
                            this.mesh.lookAt(this.mesh.position.x + 500, this.mesh.position.y);
                             break;
                    }
                    gl.Views[0].Camera.lookAt(this.mesh.position);

                }
                if (this.Orientation) {
                    //

                }
            }
            console.log("Hero Orientation: ", target.Orientation, this.Orientation);
        }
    }

    public Init2D(ctx: CanvasRenderingContext2D): void {
        //throw new Error('Method not implemented.');
        if (!this.texture) {
            this.texture = Color.FromString("#F2000F");
        }
        // On s'assure d'avoir les bonnes inforamtions sur la cellule
        this.move2D();
        let that = this;
        ModelEvents.MovementEmitter.subscribe(function (_event: PersonnageMovedEvent) {
            if (_event.Personnage.Equals(that.Model))
                that.move2D(_event.Direction);
                _event.preventDefault();
        });
        console.log("Hero", this.texture.toString());
    }

    public move2D(direction?:string) {
        let targetB = this.maze.GetTile(this._model.Cell);        
        if (targetB) {
            this.Bounds = new Rectangle2D(new Point2D(targetB.Bounds.X + 3, targetB.Bounds.Y + 3), targetB.Bounds.Width - 6, targetB.Bounds.Height - 6);
            this.Model.NeedToMove = false;

            if( direction ){
                console.log("Move " + direction);
                switch (direction) {
                    case "top":
                    case "up":
                        this.Orientation = new THREE.Vector3(0, 1, 0);
                        
                        break;
                    case "right":
                        this.Orientation = new THREE.Vector3(1, 0, 0);
                        break;
                    case "bottom":
                        case "down":
                        this.Orientation = new THREE.Vector3(0, -1, 0);
                        break;
                    case "left":
                        this.Orientation = new THREE.Vector3(-1, 0, 0);
                        break;
                }
                console.log(`(${this.Orientation.x},${this.Orientation.y})`)
            }
        }

    }

    public get HasMoved() { return this.Model.NeedToMove; }

    public Draw3D(gl: WebGLService): void {

        //throw new Error('Method not implemented.');
    }
    public Draw2D(ctx: CanvasRenderingContext2D): void {
        // if( this.HasMoved ){ this.move2D();}
        if (this.texture && this.texture instanceof Color) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(this.Bounds.Left, this.Bounds.Top, this.Bounds.Width, this.Bounds.Height);
            ctx.strokeStyle = this.texture.toString();
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.moveTo(this.Bounds.X + this.Bounds.Width / 2, this.Bounds.Top + 20);
            ctx.lineTo(this.Bounds.X + this.Bounds.Width / 2, this.Bounds.Bottom - 20);
            ctx.stroke();
        }
        else if (this.texture) { // Image
            // Chargement de l'image dans la zone spéciale
            if (!this.texture.isLoaded) {
                let that = this;
                setTimeout(function () { that.Draw2D(ctx); }, 10);
                return;
            }
            let roatation = 0;
            if( this.Orientation ){                
                // ON va au centre de la zone d'affichage
                console.log(`Working in [${this.Bounds}] Transating to [${this.Bounds.CenterX}, ${this.Bounds.CenterY}] (${this.Orientation.x},${this.Orientation.y})`);
                //ctx.translate(this.Bounds.X + (this.Bounds.Width/2), this.Bounds.Y + (this.Bounds.Height/2));
                // On fait tourner l'image en fonction de la direction               
                if( this.Orientation.y < 0){ // down (180°)
                    roatation = Math.PI;
                }
                else if( this.Orientation.x > 0){
                    // right (90°)
                    roatation = Math.PI/2;
                }else if( this.Orientation.x < 0){
                    // left (270°)
                    roatation = -Math.PI/2;
                }
                else{
                    // top (0°)
                    roatation = -Math.PI/2;
                }
            }
            ctx.save();
            ctx.translate(this.Bounds.CenterX, this.Bounds.CenterY);
            ctx.rotate(roatation);
            ctx.translate(-this.Bounds.CenterX, -this.Bounds.CenterY);
            ctx.drawImage(this.texture.Image,this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
            ctx.restore();
            
        }
        let scoreTxt = `Score: ${(this.Model as PersoHero).Score}`;        
        ctx.fillStyle = "#FFFFFF";
        let txtInfo = ctx.measureText(scoreTxt);
        ctx.fillText(scoreTxt, 10, 10);
        //console.log("Draw2D Hero", this);
    }

    dispose(){
        super.dispose();
        if( this.mouvementEmitter) this.mouvementEmitter.unsubscribe();
    }

}