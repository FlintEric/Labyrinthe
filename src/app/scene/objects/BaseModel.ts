import { WebGLService } from "../services";
import * as THREE from "three";

export class Point {
    constructor(private x: number, private y: number, private z: number) { }

    public get X(): number { return this.x; }
    public set X(value: number) { this.x = value; }
    public get Y(): number { return this.y; }
    public set Y(value: number) { this.y = value; }

    public get Z(): number { return this.z; }
    public set Z(value: number) { this.z = value; }

    public Equals(pt: Point): boolean {
        return this.Z === pt.Z && this.X === pt.X && this.Y === pt.Y;
    }
}

export class Point2D extends Point {
    constructor(x: number, y: number) {
        super(x, y, 0);
    }

}

export class Rectangle {
    constructor(private pt: Point, private width: number, private height: number, private depth: number) { }

    public get X() { return this.pt.X; }
    public get Y() { return this.pt.Y; }
    public get Z() { return this.pt.Z; }
    public get Location() { return this.pt; }
    public set Location(value: Point) { this.pt = value; }
    public set X(value: number) { this.pt.X = value; }
    public set Y(value: number) { this.pt.Y = value; }
    public set Z(value: number) { this.pt.Z = value; }

    public get Width() { return this.width; }
    public get Height() { return this.height; }
    public get Depth() { return this.depth; }
    public set Width(value: number) { this.width = value; }
    public set Height(value: number) { this.height = value; }
    public set Depth(value: number) { this.depth = value; }

    public get Top() { return this.pt.Y; }
    public get Left() { return this.pt.X; }
    public get Right() { return this.pt.X + this.Width; }
    public get Bottom() { return this.pt.Y + this.Height; }

    public Equals(rect: Rectangle): boolean {
        return this.Location.Equals(rect.Location) &&
            this.Width === rect.Width &&
            this.Height === rect.Height &&
            this.Depth === rect.Depth;
    }

    public toString():string {
        return `[${this.Left}, ${this.Top}, ${this.Z}, ${this.Right}, ${this.Bottom}, ${this.Z+this.Depth}]`;
    }
}

export class Rectangle2D extends Rectangle {
    constructor(pt: Point2D, width: number, height: number) {
        super(pt, width, height, 0);
    }
}


export class Color {
    constructor(red: number = 0, green: number = 0, blue: number = 0, alpha: number | undefined = undefined) {
        this._r = this.toColorNumber(red);
        this._g = this.toColorNumber(green);
        this._b = this.toColorNumber(blue);
        if (alpha !== undefined)
            this._a = this.toColorNumber(alpha);
    }
    private toColorNumber(value: number): number {
        value = Math.floor(value);
        value = value % 256;
        return value;
    }
    private _r: number;
    private _g: number;
    private _b: number;
    private _a: number | undefined;
    public get Red() { return this._r; }
    public get Blue() { return this._b; }
    public get Green() { return this._g; }
    public get Alpha() { return this._a; }
    public set Red(value: number) {
        this._r = this.toColorNumber(value);
    }
    public set Green(value: number) { this._g = this.toColorNumber(value); }
    public set Blue(value: number) { this._b = this.toColorNumber(value); }
    public set Alpha(value: number | undefined) { if (value !== undefined) this._a = this.toColorNumber(value); else this._a = undefined; }

    public static FromString(value: string): Color {
        if (value.indexOf("#") !== 0 || ([7].indexOf(value.length) === -1)) throw new Error("Invalid Color String");
        let v = value.substr(1);
        let rv = Number.parseInt(v.substr(0, 2), 16);
        let gv = Number.parseInt(v.substr(2, 2), 16);
        let bv = Number.parseInt(v.substr(4, 2), 16);
        return new Color(rv, gv, bv);
    }

    public toString() {
        let arr = [this.Red, this.Green, this.Blue];
        let res = "#";
        for (let v of arr) {
            let str = v.toString(16);
            str = str.length === 0 ? "00" :
                str.length === 1 ? "0" + str :
                    str.length === 2 ? str : str.substring(str.length - 2, str.length);
            res += str;
        }
        return res.toUpperCase();
    }

    public toHex(): number {
        return (256 * 256 * this.Red) + (256 * this.Green) + (this.Blue);
    }
}

export class FontRessource {
    private static fonts: any = {};
    private preloaded = false;

    private static fontLoader = new THREE.FontLoader();
    private _font?:THREE.Font;

    constructor(private _path: string, private _name:string){
        FontRessource.fonts[_name] = this;
        FontRessource.fontLoader.load(_path, response => {
            this._font = response;
            this.preloaded=true;
        });
    }
    public get isLoaded(): boolean { return this.preloaded; }
    public get Font():THREE.Font|undefined { return this._font; }

    private static _allLoaded: boolean = false;
    public static get AllLoaded(): boolean {
        if (FontRessource._allLoaded) return true;
        else {
            let isloaded = true;
            for (let img of Object.keys(FontRessource.LoadedFonts)) {
                isloaded = isloaded && FontRessource.LoadedFonts[img].isLoaded;
            }
            FontRessource._allLoaded = isloaded;
            return FontRessource._allLoaded;
        }
    }


    public static get LoadedFonts() {
        return FontRessource.fonts;
    }
}

export class ImageRessource {
    private static images: any = {};
    private preloaded = false;
    public get Path() { return this._path; }
    private img: HTMLImageElement;

    private texture?: THREE.Texture;
    public get Texture(): THREE.Texture | undefined { return this.texture; }
    public set Texture(value: THREE.Texture | undefined) { this.texture = value; }

    private static textureLoader: THREE.TextureLoader = new THREE.TextureLoader();

    constructor(private _path: string, private _name: string, private _useMap: boolean = false) {
        ImageRessource.images[_name] = this;
        this.img = new Image();
        this.img.src = _path;
        let that = this;
        this.img.onload = function () {
            that.preloaded = true;
            console.log(`L'image ${_path} est chargée`);
        }
        if (ImageRessource.textureLoader && _useMap) {
            this.texture = ImageRessource.textureLoader.load(_path);
        }
    }

    public get Image(): HTMLImageElement { return this.img; }

    public get isLoaded(): boolean { return this.preloaded; }
    toString() {
        let str = "Image('" + (this.Path ? this.Path : "none") + "', preloaded:" + (this.preloaded ? "true" : "false") + ")";
        return str;
    }

    public get HasMap() { return this._useMap; }


    private mapImages:any = {};
    public MapImage(map:Rectangle2D){
        let mapKey:string = map.toString();        
        if( !this.mapImages[mapKey]){
            // Création d'un canvas
            const ctx = document.createElement("canvas").getContext("2d");
            if (ctx) {
                ctx.canvas.width = 512;
                ctx.canvas.height = 512;
                ctx.fillStyle = '#FFF';
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.drawImage(this.Image, map.X, map.Y, map.Width, map.Height, 0, 0, ctx.canvas.width, ctx.canvas.height);
                this.mapImages[mapKey] =  ctx.canvas;
            }           
        } 
        return this.mapImages[mapKey];
    }

    private static _allLoaded: boolean = false;
    public static get AllLoaded(): boolean {
        if (ImageRessource._allLoaded) return true;
        else {
            let isloaded = true;
            for (let img of Object.keys(ImageRessource.LoadedImages)) {
                isloaded = isloaded && ImageRessource.LoadedImages[img].isLoaded;
            }
            ImageRessource._allLoaded = isloaded;
            return ImageRessource._allLoaded;
        }
    }


    public static get LoadedImages() {
        return ImageRessource.images;
    }
}



export abstract class BaseModel {
    private static idCount:number=0;
    protected static ComputeId():number {
        return BaseModel.idCount++;
    };

    public readonly id = BaseModel.ComputeId();
    private _boundRect: Rectangle = new Rectangle2D(new Point2D(0, 0), 0, 0); // Valeur par défaut pourrie

    public get Bounds(): Rectangle { return this._boundRect; }
    public set Bounds(value: Rectangle) { this._boundRect = value; }

    public get Position(): Point2D { return this._boundRect.Location; }
    public set Position(value: Point2D) { this._boundRect.Location = value; }

    private subModels: BaseModel[] = [];
    public get SubModels(): BaseModel[] { return this.subModels; }

    public mesh?:THREE.Mesh;

    public Equals(obj: BaseModel): boolean {                
        if( this.id === obj.id) return true;
       /* if (!this.Bounds.Equals(obj.Bounds)) return false;
        let equ = true;
        if (this.SubModels.length === obj.SubModels.length) {
            for (let sub of this.SubModels) {
                let found = false;
                for (let ss of obj.SubModels)
                    if (sub.Equals(ss)) { found = true; break; }
                if (!found) {
                    equ = false;
                    break;
                }
            }
            // TODO Coder cette partie de la fonction
        } else {
            equ = false;
        }
        return equ;*/
        return false;
    }

    public equals(obj: BaseModel):boolean{
        return this.Equals(obj);
    }

    public abstract Init3D(srv: WebGLService): void;
    public abstract Init2D(ctx: CanvasRenderingContext2D): void;

    public abstract Draw3D(gl: WebGLService): void;
    public abstract Draw2D(ctx: CanvasRenderingContext2D): void;

    public dispose(){
        if( this.subModels && this.subModels.length > 0){
            for(let s of this.subModels){
                s.dispose();
            }
        }
    }
}