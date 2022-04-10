import { BaseDecor } from './BaseDecor';
import { Cell, Maze, Personnage } from '../../../models';
import { Color, Point2D, ImageRessource } from '../BaseModel';
import { Floor } from './Floor';
import { Wall } from './Wall';
import { WebGLService } from '../../services';

export class VMaze extends BaseDecor {
    public static get DefaultTileWidth() { return 25; }
    public static get DefaultTileHeight() { return 25; }
    public static get DefaultTileDepth(){ return 25; }
    public static get DefaultWallThickness() { return 2; }


    constructor(private model: Maze, private tileW: number = VMaze.DefaultTileWidth, private tileH: number = VMaze.DefaultTileHeight, private tileD:number = VMaze.DefaultTileDepth, private wallThick: number = VMaze.DefaultWallThickness) {
        super();
    }
    public get Model() { return this.model; }
    public get TileWidth() { return this.tileW; }
    public get TileHeight() { return this.tileH; }
    public get TileDepth(){ return this.tileD; }

    
    public Init(): void {
        // Calcul du laby
        this.model.Generate();

    }
    public async Init3D(gl: WebGLService): Promise<void> {
        if (!this.model.Computed) this.Init();
        
        // Pour chaque élément on ajoute le contenu.        
        let pool:Promise<any>[] = [];
        for(let i = 0; i < this.model.Columns; i++){
            for(let j = 0; j< this.model.Lines; j++){
                let cell = this.model.Cellules[i][j];
                let txt = undefined;               
                let f = ImageRessource.LoadedImages["floor"];
                if( f ){ txt = f; }
                let floor = new Floor(new Point2D(cell.x * this.TileWidth, -cell.y * this.TileHeight), this.TileWidth, this.TileHeight, this.TileDepth, txt);
                floor.Model = cell;
                pool.push(floor.Init3D(gl));
                this.AddTile(floor);
                if(pool.length > 10){
                    await Promise.all(pool);
                    pool = [];
                }

                let murs = cell.Murs;
                txt = undefined;
                let im = ImageRessource.LoadedImages["wall"];
                if( im ) txt = im.Texture;
                if (murs[0]) { //Left
                    let m = new Wall(new Point2D(floor.Bounds.Left - floor.Bounds.Width/2 + this.wallThick/2, floor.Bounds.Top), this.wallThick, this.tileH, this.TileDepth, txt);
                    m.Init3D(gl);
                    this.AddTile(m);
                }
                if (murs[1]) {// Top
                    let m = new Wall(new Point2D(floor.Bounds.Left, floor.Bounds.Top+floor.Bounds.Height/2+ this.wallThick/2), this.tileW, this.wallThick, this.TileDepth, txt);
                    m.Init3D(gl);                    
                    this.AddTile(m);
                }
                if (murs[2]) { // Right
                    let m = new Wall(new Point2D(floor.Bounds.Right - floor.Bounds.Width/2 - this.wallThick/2, floor.Bounds.Top), this.wallThick, this.tileH, this.TileDepth, txt);
                    m.Init3D(gl);
                    this.AddTile(m);}
                if (murs[3]) { // Bottom
                    let m = new Wall(new Point2D(floor.Bounds.Left, floor.Bounds.Bottom - floor.Bounds.Height*3/2 - this.wallThick/2), this.tileW, this.wallThick, this.TileDepth, txt);
                    m.Init3D(gl);
                    this.AddTile(m);
                }
                
            }
        }
    }

    public Init2D(ctx: CanvasRenderingContext2D): void {
        if (!this.model.Computed) this.Init();
        this.tileW = ctx.canvas.width / this.model.Lines;
        this.tileH = ctx.canvas.height / this.model.Columns;
        
        for (let i = 0; i < this.model.Columns; i++) {
            for (let j = 0; j < this.model.Lines; j++) {
                let cell = this.model.Cellules[i][j];
                let txt = undefined;               
                let f = ImageRessource.LoadedImages["floor"];
                if( f ){ txt = f; }
              
                let floor = new Floor(new Point2D(cell.x * this.tileW, cell.y * this.tileH), this.tileW, this.tileH, this.TileDepth, txt);
                floor.Model = cell;
                floor.Init2D();
                
                this.AddTile(floor);
                let murs = cell.Murs;
                txt = undefined;
                let im = ImageRessource.LoadedImages["wall"];
                if( im ) txt = im;
                if (murs[0]) { //Left                    
                    let m = new Wall(new Point2D(floor.Bounds.Left, floor.Bounds.Top), this.wallThick, this.tileH, this.TileDepth, txt);
                    m.Init2D();
                    this.AddTile(m);
                }
                if (murs[1]) {// Top
                    let m = new Wall(new Point2D(floor.Bounds.Left, floor.Bounds.Top), this.tileW, this.wallThick, this.TileDepth, txt);
                    m.Init2D();
                    this.AddTile(m);
                }
                if (murs[2]) { // Right
                    let m = new Wall(new Point2D(floor.Bounds.Right - this.wallThick, floor.Bounds.Top), this.wallThick, this.tileH, this.TileDepth, txt);
                    m.Init2D();
                    this.AddTile(m);
                }
                if (murs[3]) { // Bottom
                    let m = new Wall(new Point2D(floor.Bounds.Left, floor.Bounds.Bottom - this.wallThick), this.tileW, this.wallThick, this.TileDepth, txt);
                    m.Init2D();
                    this.AddTile(m);
                }
                floor.debugData = [`${cell.x}, ${cell.y} [${murs[0] ? 1 : 0}, ${murs[1] ? 1 : 0}, ${murs[2] ? 1 : 0}, ${murs[3] ? 1 : 0}]`,
                `L:[${cell.Left ? (cell.Left.x + "," + cell.Left.y) : ""}]${murs[0] ? "*" : ""}`,
                `T:[${cell.Top ? (cell.Top.x + "," + cell.Top.y) : ""}]${murs[1] ? "*" : ""}`,
                `R:[${cell.Right ? (cell.Right.x + "," + cell.Right.y) : ""}]${murs[2] ? "*" : ""}`,
                `B:[${cell.Bottom ? (cell.Bottom.x + "," + cell.Bottom.y) : ""}]${murs[3] ? "*" : ""}`];

            }
        }

    }

    public Draw3D(gl: WebGLService): void {
        //throw new Error('Method not implemented.');
        
    }

    public Draw2D(ctx: CanvasRenderingContext2D): void {
        // Tile background
        for (let sub of this.SubModels) {
            sub.Draw2D(ctx);
        }
        ctx.beginPath();
        ctx.lineWidth = this.wallThick;
        ctx.strokeStyle = "#BBBB00";
        ctx.rect(this.Bounds.Left, this.Bounds.Top, this.Bounds.Width, this.Bounds.Height);
        ctx.stroke();
        //console.log("Draw2D", this);
    }


    public GetTile(cell:Cell): Floor|undefined {
        for(let f of this.SubTiles){
            if( f instanceof Floor && f.Model && f.Model instanceof Cell){
                if(f.Model.Equals(cell)) return f;
            }
        } 
        return undefined;
    }
    public get Start(){
        for(let f of this.SubTiles){
            if( f instanceof Floor && f.Model && f.Model.isStart){
                return f;
            }
        }
        return undefined;
    }
}