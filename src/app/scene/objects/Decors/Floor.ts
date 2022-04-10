import { Cell } from 'src/app/models';
import { Point, Rectangle, Rectangle2D, Color, ImageRessource, Point2D } from '../BaseModel';
import { BaseDecor } from "./BaseDecor";
import { Wall } from "./Wall";
import { WebGLService } from "../../services";

import * as THREE from "three";

let showDebug = false;

export class Floor extends BaseDecor {

    public debugData: string[];
    private _model?: Cell;
    public get Model() { return this._model; }
    public set Model(value) { this._model = value; }

    constructor(pt: Point, width: number, height: number, depth: number, private texture?: Color | ImageRessource) {
        super();
        this.Bounds = new Rectangle(pt, width, height, depth);
        this.debugData = [];
    }

    public TextureMap(): Rectangle2D | undefined {
        let sWidth = 512, sHeight = 512;
        if (!this.Model) return undefined;
        // Affichage en fonction des "lignes" de l'image souce
        if (this.Model.Murs[0] && this.Model.Murs[1] && !this.Model.Murs[2] && !this.Model.Murs[3]) { // murs gauche + haut
            return new Rectangle2D(new Point2D(0, 0), sWidth, sHeight);
        } else if (!this.Model.Murs[0] && this.Model.Murs[1] && !this.Model.Murs[2] && !this.Model.Murs[3]) { // murs haut
            return new Rectangle2D(new Point2D(sWidth, 0), sWidth, sHeight);
        } else if (!this.Model.Murs[0] && this.Model.Murs[1] && this.Model.Murs[2] && !this.Model.Murs[3]) { // murs haut + droite
            return new Rectangle2D(new Point2D(sWidth * 2, 0), sWidth, sHeight);
        } else if (!this.Model.Murs[0] && this.Model.Murs[1] && this.Model.Murs[2] && this.Model.Murs[3]) { // murs haut + droite + bas
            return new Rectangle2D(new Point2D(sWidth * 3, 0), sWidth, sHeight);
        } else if (this.Model.Murs[0] && !this.Model.Murs[1] && !this.Model.Murs[2] && !this.Model.Murs[3]) { // murs gauche
            return new Rectangle2D(new Point2D(0, sHeight), sWidth, sHeight);
        } else if (!this.Model.Murs[0] && !this.Model.Murs[1] && !this.Model.Murs[2] && !this.Model.Murs[3]) { // aucun murs
            return new Rectangle2D(new Point2D(sWidth, sHeight), sWidth, sHeight);
        } else if (!this.Model.Murs[0] && !this.Model.Murs[1] && this.Model.Murs[2] && !this.Model.Murs[3]) {  // mur droite
            return new Rectangle2D(new Point2D(sWidth * 2, sHeight), sWidth, sHeight);
        } else if (this.Model.Murs[0] && this.Model.Murs[1] && this.Model.Murs[2] && !this.Model.Murs[3]) {// mur gauche + haut + droite
            return new Rectangle2D(new Point2D(sWidth * 3, sHeight), sWidth, sHeight);
        } else if (this.Model.Murs[0] && !this.Model.Murs[1] && !this.Model.Murs[2] && this.Model.Murs[3]) {// mur gauche + bas
            return new Rectangle2D(new Point2D(0, sHeight * 2), sWidth, sHeight);
        } else if (!this.Model.Murs[0] && !this.Model.Murs[1] && !this.Model.Murs[2] && this.Model.Murs[3]) {// mur bas
            return new Rectangle2D(new Point2D(sWidth, sHeight * 2), sWidth, sHeight);
        } else if (!this.Model.Murs[0] && !this.Model.Murs[1] && this.Model.Murs[2] && this.Model.Murs[3]) {// mur droite + bas
            return new Rectangle2D(new Point2D(sWidth * 2, sHeight * 2), sWidth, sHeight);
        } else if (this.Model.Murs[0] && !this.Model.Murs[1] && this.Model.Murs[2] && this.Model.Murs[3]) {// mur gauche + droite + bas
            return new Rectangle2D(new Point2D(sWidth * 3, sHeight * 2), sWidth, sHeight);
        } else if (this.Model.Murs[0] && !this.Model.Murs[1] && this.Model.Murs[2] && !this.Model.Murs[3]) {// mur gauche + droite
            return new Rectangle2D(new Point2D(sWidth, sHeight * 3), sWidth, sHeight);
        } else if (!this.Model.Murs[0] && this.Model.Murs[1] && !this.Model.Murs[2] && this.Model.Murs[3]) {// mur haut + bas
            return new Rectangle2D(new Point2D(sWidth * 2, sHeight * 3), sWidth, sHeight);
        } else if (this.Model.Murs[0] && this.Model.Murs[1] && !this.Model.Murs[2] && this.Model.Murs[3]) {// mur gauche +haut + bas
            return new Rectangle2D(new Point2D(sWidth * 3, sHeight * 3), sWidth, sHeight);
        }
        return undefined;
    }

    public get Orientation():string|undefined{
        if (!this.Model) return undefined;
        if (!this.Model.Murs[0] && this.Model.Murs[1] && this.Model.Murs[2] && this.Model.Murs[3]) {
            return "left";
        }
        else if (this.Model.Murs[0] && !this.Model.Murs[1] && this.Model.Murs[2] && this.Model.Murs[3]) {
            return "up";
        }
        else if (this.Model.Murs[0] && this.Model.Murs[1] && !this.Model.Murs[2] && this.Model.Murs[3]) {
            return "right";
        }
        else if (this.Model.Murs[0] && this.Model.Murs[1] && this.Model.Murs[2] && !this.Model.Murs[3]) {
            return "down";
        }
        return undefined;
    }

    public get Mesh(){ return this.mesh; }

    public async Init3D(gl: WebGLService): Promise<void> {
        //let geometry = new THREE.PlaneGeometry(this.Bounds.Width, this.Bounds.Height, 1, 1);
        let geometry = new THREE.BoxGeometry(this.Bounds.Width, this.Bounds.Height, 0, 1, 1, 1);
        let material: THREE.Material;
        if (!this.texture) {
            material = new THREE.MeshBasicMaterial({ color: 0xa0f0ff, side: THREE.FrontSide });
        } else if (this.texture instanceof Color) {
            material = new THREE.MeshBasicMaterial({ color: this.texture.toHex(), side: THREE.FrontSide });
        }
        else if (this.texture instanceof THREE.Texture) {
            let matmap = this.TextureMap();
            material = new THREE.MeshLambertMaterial({ map: this.texture });

            if (matmap) { // Attention ne fonctionne pas !!!
                let uvs: number[] = [matmap.Left, matmap.Top,
                matmap.Right, matmap.Top,
                matmap.Left, matmap.Bottom,
                matmap.Right, matmap.Bottom
                ];
                geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
            }



            //material = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide }); 
        } else if (this.texture instanceof ImageRessource) {
            if (!this.texture.isLoaded) {
                const that = this;
                setTimeout(function () { that.Init3D(gl); }, 10);
                return;
            }
            let map = this.TextureMap();
            if (map) {
                this.texture.Texture = new THREE.CanvasTexture(this.texture.MapImage(map));
            }
            material = new THREE.MeshBasicMaterial({ map: this.texture.Texture });
        }
        else {
            material = new THREE.MeshBasicMaterial({ color: 0xadf01f, side: THREE.FrontSide });
        }



        let floor = new THREE.Mesh(geometry, material);
        floor.position.x = this.Bounds.Left;
        floor.position.y = this.Bounds.Top;

        floor.receiveShadow = true;
        this.mesh = floor;
        gl.Scene.add(floor);

        if (this.Model && (this.Model.isStart || this.Model.isEnd))  {
            // ON place un rectangle bleu
            let geometry = new THREE.BoxGeometry(this.Bounds.Width, this.Bounds.Height, this.Bounds.Depth, 1, 1, 1);
            let material:THREE.Material;
            if( this.Model.isStart) material = new THREE.MeshLambertMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5});
            else material = new THREE.MeshLambertMaterial({ color: 0xff0000, transparent:true, opacity:0.5});
            //material.alphaMap = ;

            let cube = new THREE.Mesh(geometry, material);
            cube.position.x = this.Bounds.Left;
            cube.position.y = this.Bounds.Top;
            cube.position.z = this.Bounds.Depth/2;
            gl.Scene.add(cube);
            
        } 
        //throw new Error('Method not implemented.');
    }

    public Init2D(): void {
        if (!this.texture) {
            let c = 0;//Math.floor(Math.random()*100) % 4;
            switch (c) {
                case 0: this.texture = Color.FromString("#FFFF44"); break;
                case 1: this.texture = Color.FromString("#FFFFFF"); break;
                case 2: this.texture = Color.FromString("#00FF00"); break;
                case 3: this.texture = Color.FromString("#8888AA"); break;
            }

        }
    }

    public Draw3D(gl: WebGLService): void {
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
            if (this.Model && (this.texture.Image.width === 1536 || this.texture.Image.height === 2048)) {
                // Récupération des information de la cellule pour savoir quelle texture appliquer.
                let map = this.TextureMap();
                if (map) {
                    ctx.drawImage(this.texture.Image, map.X, map.Y, map.Width, map.Height, this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
                } else { // Fallback
                    let sWidth = 512, sHeight = 512;
                    // Affichage en fonction des "lignes" de l'image souce
                    if (this.Model.Murs[0] && this.Model.Murs[1] && !this.Model.Murs[2] && !this.Model.Murs[3]) { // murs gauche + haut
                        ctx.drawImage(this.texture.Image, 0, 0, sWidth, sHeight, this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
                    } else if (!this.Model.Murs[0] && this.Model.Murs[1] && !this.Model.Murs[2] && !this.Model.Murs[3]) { // murs haut
                        ctx.drawImage(this.texture.Image, sWidth, 0, sWidth, sHeight, this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
                    } else if (!this.Model.Murs[0] && this.Model.Murs[1] && this.Model.Murs[2] && !this.Model.Murs[3]) { // murs haut + droite
                        ctx.drawImage(this.texture.Image, sWidth * 2, 0, sWidth, sHeight, this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
                    } else if (!this.Model.Murs[0] && this.Model.Murs[1] && this.Model.Murs[2] && this.Model.Murs[3]) { // murs haut + droite + bas
                        ctx.drawImage(this.texture.Image, sWidth * 3, 0, sWidth, sHeight, this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
                    } else if (this.Model.Murs[0] && !this.Model.Murs[1] && !this.Model.Murs[2] && !this.Model.Murs[3]) { // murs gauche
                        ctx.drawImage(this.texture.Image, 0, sHeight, sWidth, sHeight, this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
                    } else if (!this.Model.Murs[0] && !this.Model.Murs[1] && !this.Model.Murs[2] && !this.Model.Murs[3]) { // aucun murs
                        ctx.drawImage(this.texture.Image, sWidth, sHeight, sWidth, sHeight, this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
                    } else if (!this.Model.Murs[0] && !this.Model.Murs[1] && this.Model.Murs[2] && !this.Model.Murs[3]) {  // mur droite
                        ctx.drawImage(this.texture.Image, sWidth * 2, sHeight, sWidth, sHeight, this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
                    } else if (this.Model.Murs[0] && this.Model.Murs[1] && this.Model.Murs[2] && !this.Model.Murs[3]) {// mur gauche + haut + droite
                        ctx.drawImage(this.texture.Image, sWidth * 3, sHeight, sWidth, sHeight, this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
                    } else if (this.Model.Murs[0] && !this.Model.Murs[1] && !this.Model.Murs[2] && this.Model.Murs[3]) {// mur gauche + bas
                        ctx.drawImage(this.texture.Image, 0, sHeight * 2, sWidth, sHeight, this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
                    } else if (!this.Model.Murs[0] && !this.Model.Murs[1] && !this.Model.Murs[2] && this.Model.Murs[3]) {// mur bas
                        ctx.drawImage(this.texture.Image, sWidth, sHeight * 2, sWidth, sHeight, this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
                    } else if (!this.Model.Murs[0] && !this.Model.Murs[1] && this.Model.Murs[2] && this.Model.Murs[3]) {// mur droite + bas
                        ctx.drawImage(this.texture.Image, sWidth * 2, sHeight * 2, sWidth, sHeight, this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
                    } else if (this.Model.Murs[0] && !this.Model.Murs[1] && this.Model.Murs[2] && this.Model.Murs[3]) {// mur gauche + droite + bas
                        ctx.drawImage(this.texture.Image, sWidth * 3, sHeight * 2, sWidth, sHeight, this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
                    } else if (this.Model.Murs[0] && !this.Model.Murs[1] && this.Model.Murs[2] && !this.Model.Murs[3]) {// mur gauche + droite
                        ctx.drawImage(this.texture.Image, sWidth, sHeight * 3, sWidth, sHeight, this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
                    } else if (!this.Model.Murs[0] && this.Model.Murs[1] && !this.Model.Murs[2] && this.Model.Murs[3]) {// mur haut + bas
                        ctx.drawImage(this.texture.Image, sWidth * 2, sHeight * 3, sWidth, sHeight, this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
                    } else if (this.Model.Murs[0] && this.Model.Murs[1] && !this.Model.Murs[2] && this.Model.Murs[3]) {// mur gauche +haut + bas
                        ctx.drawImage(this.texture.Image, sWidth * 3, sHeight * 3, sWidth, sHeight, this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
                    }
                }
            }
            else {
                ctx.drawImage(this.texture.Image, this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
            }

            if (this.Model && (this.Model.isStart || this.Model.isEnd)) {
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = this.Model.isStart ? "blue" : "red";
                ctx.fillRect(this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
                ctx.globalAlpha = 1;
            }
            if( this.Model && this.Model.Visited){
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = "orange";
                ctx.fillRect(this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
                ctx.globalAlpha = 1;
            }
        }

        if (showDebug && this.debugData && this.debugData.length > 0) {
            let str = this.debugData[0];
            let r = str.split("[");
            r[1] = "[" + r[1];
            ctx.fillStyle = "#000000";
            for (let i = 0; i < r.length; i++) {
                let metrix = ctx.measureText(r[i]);
                let line = i * metrix.fontBoundingBoxAscent.valueOf();
                ctx.fillText(r[i], this.Bounds.X + (this.Bounds.Width - metrix.width) / 2, this.Bounds.Y + (this.Bounds.Height / 2) + line);
            }

            // Left
            str = this.debugData[1];
            if (str.indexOf("*") > -1) ctx.fillStyle = "#FFFFFF";
            else ctx.fillStyle = "#FF0000";
            ctx.fillText(str, this.Bounds.Left + 5, this.Bounds.Y + (this.Bounds.Height / 2));

            // Top
            str = this.debugData[2];
            if (str.indexOf("*") > -1) ctx.fillStyle = "#FFFFFF";
            else ctx.fillStyle = "#0000FF";
            let metrix = ctx.measureText(str);
            console.log(`Top: ${this.Bounds.Left + (this.Bounds.Width - metrix.width) / 2}, ${this.Bounds.Top + 15}`);
            ctx.fillText(str, this.Bounds.Left + (this.Bounds.Width - metrix.width) / 2, this.Bounds.Top + 15);

            // Right
            str = this.debugData[3];
            if (str.indexOf("*") > -1) ctx.fillStyle = "#FFFFFF";
            else ctx.fillStyle = "#0000FF";
            metrix = ctx.measureText(str);
            ctx.fillText(str, this.Bounds.Right - metrix.width, this.Bounds.Y + (this.Bounds.Height / 2));

            // Bottom
            str = this.debugData[4];
            if (str.indexOf("*") > -1) ctx.fillStyle = "#FFFFFF";
            metrix = ctx.measureText(str);
            console.log(`Bottom: ${this.Bounds.Left + (this.Bounds.Width - metrix.width) / 2}, ${this.Bounds.Bottom - 10}`)
            ctx.fillText(str, this.Bounds.Left + (this.Bounds.Width - metrix.width) / 2, this.Bounds.Bottom - 10);
        }

    }

}