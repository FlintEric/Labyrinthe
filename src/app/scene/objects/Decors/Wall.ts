import { WebGLService } from '../../services';
import { Color, Point, ImageRessource, Rectangle } from '../BaseModel';
import { BaseDecor } from './BaseDecor';
import * as THREE from "three";

export class Wall extends BaseDecor {

    constructor(pt: Point, width: number, height: number, depth: number, private texture?: Color | ImageRessource) {
        super();
        this.Bounds = new Rectangle(pt, width, height, depth);
    }

    public Init3D(gl: WebGLService): void {        
        //console.log(">Wall: ",this.Bounds);
        let geometry = new THREE.BoxGeometry(this.Bounds.Width, this.Bounds.Height, this.Bounds.Depth);
        let material: THREE.Material;
        if (this.texture instanceof Color) {
            material = new THREE.MeshBasicMaterial({ color: this.texture.toHex() });
        } else if (!this.texture) {
            material = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        }
        else if (this.texture instanceof THREE.Texture) {
            material = new THREE.MeshLambertMaterial({ map: this.texture });
        }else{
            material = new THREE.MeshBasicMaterial({ color: 0x0000ff});
        }

        let wall = new THREE.Mesh(geometry, material);
        wall.position.x = this.Bounds.Left;
        wall.position.y = this.Bounds.Top;
        wall.position.z = this.Bounds.Depth/2;
        wall.receiveShadow = true;

        this.mesh = wall;
        gl.Scene.add(wall);

    }
    public Init2D(): void {
        if (!this.texture) {
            this.texture = Color.FromString("#000000");
        }
    }
    public Draw3D(): void {
        // En fonction du mur, il y a peut etre une animation de texture a ajouter.

        //throw new Error('Method not implemented.');
    }
    public Draw2D(ctx: CanvasRenderingContext2D): void {
        if (this.texture instanceof Color) {
            ctx.fillStyle = this.texture.toString();
            ctx.fillRect(this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
        }
        else if (this.texture) { // Image
            // Chargement de l'image dans la zone spéciale
            if (!this.texture.isLoaded) {
                let that = this;
                setTimeout(function () { that.Draw2D(ctx); }, 10);
                return;
            }

            ctx.drawImage(this.texture.Image, this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);

        }
    }

}