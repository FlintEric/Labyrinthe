export class Maze {
    private static mazeCount = 0;
    private _sud: Uint16Array;
    private _est: Uint16Array;
    private _isComputed: boolean;

    private id: number;

    private _globalCells: Cell[][] = [];

    constructor(private _columns: number, private _lines: number) {
        this._sud = new Uint16Array(this.Columns * this.Lines);
        this._est = new Uint16Array(this.Columns * this.Lines);
        this._isComputed = false;
        this.id = Maze.mazeCount;
        Maze.mazeCount++;
    }

    /** Nombre de lignes */
    public get Lines() { return this._lines; }
    /** Nombre de colonnes */
    public get Columns() { return this._columns; }

    /** Murs intérieurs verticaux */
    public get Est() { return this._est; }
    /** Murs intérieurs horizontaux */
    public get Sud() { return this._sud; }

    public get Cellules() {
        return this._globalCells;
    }

    Fusion() {
        // Revoir l'algorithme

        // William VOIROL, Switzerland, Dec 2016
        let ne = this.Columns * this.Lines;
        let nm = 2 * ne - this.Columns - this.Lines;
        let murs = new Uint32Array(nm);
        let set = new Uint32Array(ne);
        for (let e = 0; e < ne; ++e) { this._est[e] = this._sud[e] = 1; set[e] = e; } // Initialisation
        let e: number, m: number;
        for (e = 0, m = 0; e < ne - this.Columns; e++) murs[m++] = e;// murs horizontaux + verticaux
        for (e = 0; e < ne; e++) if ((e % this.Columns) !== (this.Columns - 1)) murs[m++] = e + ne; // ici on a m=nm
        do {
            let r = ~~(m * Math.random());
            e = murs[r];
            murs[r] = murs[--m];
            murs[m] = e;
        } while (m);
        m = nm;
        let o: number, v: number;
        do {
            e = murs[--m];
            if (e < ne) { if ((o = set[e]) != (v = set[e + this.Columns])) this._sud[e] = 0; } // horizontal
            else { e -= ne; if ((o = set[e]) != (v = set[e + 1])) this._est[e] = 0; } // vertical
            if (o !== v) for (e = 0; e < ne; ++e) if (set[e] === v) set[e] = o; // fusion
        } while (m);
    }

    Murs() {
        let l: number, e: number, m: number = 0;
        for (l = 1, e = 0; l < this.Lines; ++l)
            for (let c = 0; c < this.Columns; ++c) m += this._sud[e++];
        for (l = 0, e = 0; l < this.Lines; ++l, ++e)
            for (let c = 1; c < this.Columns; ++c) m += this._est[e++];
        if (m !== (this.Columns) * (this.Lines - 1)) throw new Error(`Murs incorrects: ${m}`);
    }

    Explore() {
        // On part d'un labyrinthe ou tous les murs sont fermés. Chaque cellule contient une variable booleene qui indique si la cellule a déjà été visitée ou non.

        let unvisitedCells: Cell[] = [];
        let deadends: Cell[] = [];
        let globalCells: Cell[][] = [];
        // Initialization
        for (let x = 0; x < this.Columns; x++) {
            globalCells.push([]);
            for (let y = 0; y < this.Lines; y++) {
                let c = new Cell(x, y);
                unvisitedCells.push(c);
                globalCells[x].push(c);
                if (globalCells[x - 1] && globalCells[x - 1][y]) { c.Left = globalCells[x - 1][y]; }
                if (globalCells[x] && globalCells[x][y - 1]) { c.Top = globalCells[x][y - 1]; }
            }
        }
        // Selection de la 1ere cellule
        let startInd = Math.floor(Math.random() * unvisitedCells.length * 100) % unvisitedCells.length;

        let start: Cell = unvisitedCells[startInd];
        start.isStart = true;

        // Parcours des cellules proches
        function creuseRec(current: Cell) {
            let tries = 0;
            do {
                let next = current.Creuse();
                tries++;
                if (next) {
                    creuseRec(next);
                } else {
                    deadends.push(current);
                }
            } while (current.CanDig && tries < 4);
        }

        creuseRec(start);

        let endInd = Math.floor(Math.random() * deadends.length * 100) % deadends.length;
        let end: Cell = deadends[endInd];
        end.isEnd = true;

        // Mise à jour des murs.
        for (let i = 0; i < this.Lines * this.Columns; i++) {
            this._sud[i] = unvisitedCells[i].Murs[3] ? 1 : 0;
            this._est[i] = unvisitedCells[i].Murs[1] ? 1 : 0;
        }
        // Sauvegarde des cellules
        this._globalCells = globalCells;
    }

    Generate() {
        let isOk = false; let tries = 0;
        this.Explore();
        this._isComputed = true;
    }

    public get Computed(): boolean { return this._isComputed; }

    public Equals(other: Maze): boolean {
        console.log("Compare Maze: " + this.id + "/" + other.id);
        return (this.id === other.id);
    }
    public equals(other: Maze): boolean { return this.Equals(other); }

    public get Start() {
        if (this.Cellules) {
            for (let line of this.Cellules) {
                for (let c of line) {
                    if (c.isStart) return c;
                }
            }
        } return undefined;
    }

    public get End() {
        if (this.Cellules) {
            for (let l of this.Cellules) {
                for (let c of l) { if (c.isEnd) return c; }
            }
        }
        return undefined;
    }
}

export class Cell {
    constructor(public x: number, public y: number, public visited: boolean = false, public isStart = false, public isEnd = false) { }
    public get Id(){ return `[${this.x},${this.y}]`;}
    private _left?: Cell; private _right?: Cell; private _top?: Cell; private _bottom?: Cell;
    public get Left(): Cell | undefined { return this._left; };
    public set Left(value: Cell | undefined) { this._left = value; if (value && !value.Right) value.Right = this; }
    public get Right(): Cell | undefined { return this._right; };
    public set Right(value: Cell | undefined) { this._right = value; if (value && !value.Left) value.Left = this; }
    public get Top() { return this._top; }
    public set Top(value: Cell | undefined) { this._top = value; if (value && !value.Bottom) value.Bottom = this; }

    public get Bottom() { return this._bottom; }
    public set Bottom(value: Cell | undefined) { this._bottom = value; if (value && !value.Top) value.Top = this; }

    private _visit:boolean = false;
    public get Visited(){return  this._visit;}
    public set Visited(value:boolean){ this._visit = value;}
    // left, top, right, bottom

    public get Murs() {
        return [this._gauche, this._haut, this._droit, this._bas];
    }

    public _gauche = true;
    public _droit = true;
    public _haut = true;
    public _bas = true;

    public get CanDig(): boolean {
        if (this.Left && !this.Left.visited) return true;
        if (this.Top && !this.Top.visited) return true;
        if (this.Right && !this.Right.visited) return true;
        if (this.Bottom && !this.Bottom.visited) return true;
        return false;
    }

    public Creuse(): Cell | undefined {
        let c: Cell | undefined;
        this.visited = true;
        // Récupérer les possibilités
        let possibilites = 0; let left = -1, rigth = -1, top = -1, bottom = -1;
        if (this.Left && !this.Left.visited) { left = possibilites; possibilites++; }
        if (this.Top && !this.Top.visited) { top = possibilites; possibilites++; }
        if (this.Right && !this.Right.visited) { rigth = possibilites; possibilites++; }
        if (this.Bottom && !this.Bottom.visited) { bottom = possibilites; possibilites++; }
        if (possibilites === 0) return undefined; // Rien a faire.
        let rand = 0;
        if (possibilites > 1) {
            rand = Math.floor(Math.random() * 100) % possibilites;
        }
        if (rand === left) { this._gauche = false; c = this.Left; if (c) c._droit = false; }
        else if (rand === top) { this._haut = false; c = this.Top; if (c) c._bas = false; }
        else if (rand === rigth) { this._droit = false; c = this.Right; if (c) c._gauche = false; }
        else if (rand === bottom) { this._bas = false; c = this.Bottom; if (c) c._haut = false; }

        return c;
    }

    public Equals(obj: Cell|undefined): boolean {
        if( obj === undefined ) return false;
        return this.Id === obj.Id;//this.x == obj.x && this.y === obj.y;
    }
    public equals(obj: Cell): boolean { return this.Equals(obj); }

    public toString():string {
        let str = `Cell: [${this.x}, ${this.y}, v:${this.Visited} start:${this.isStart}, end:${this.isEnd}]`;
        return str;
    }
}

