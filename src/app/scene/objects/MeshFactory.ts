import { Coin } from "src/app/models/Coin";
import { Letter } from "src/app/models/Letter";
import * as THREE from "three";
import { Color, FontRessource, ImageRessource } from "./BaseModel";
import { Hero } from "./Personnages/Hero";


export class MeshFactory {
 
    static fontLoader = new THREE.FontLoader();

    public static Create3DCoin(_model:Coin):THREE.Mesh{
        let geometrty = new THREE.CylinderGeometry(5, 5, 2, 32);
        let material = new THREE.MeshBasicMaterial({color: 0xeed30d});
        const cylinder = new THREE.Mesh(geometrty, material);
        return cylinder;
    }

    public static Create3DLetter(model:Letter):THREE.Mesh {
        let font = FontRessource.LoadedFonts["helvetiker_regular"].Font;
        if( !font) throw new Error(`Font non chargée`);
        let geometry = new THREE.TextGeometry(model.Letter, { font: font, size: 10, height:5});
        let material = new THREE.MeshBasicMaterial({color: 0xeed30d});
        const letter = new THREE.Mesh(geometry, material);
        //letter.rotateX(-Math.PI/2 );
        
        return letter;
    }

    public static CreateHero(h:Hero):THREE.Mesh {
        let geometry = new THREE.ConeGeometry(h.Bounds.Width - 10, h.Maze.TileHeight-10, 32);
        let material: THREE.Material;
        if (h.Texture && h.Texture instanceof ImageRessource) {
            console.log(h.Texture.Image);
            material = new THREE.MeshLambertMaterial({ map: new THREE.Texture(h.Texture.Image), transparent: false, opacity: 1 });
        }
        else if (h.Texture && h.Texture instanceof Color) {
            material = new THREE.MeshLambertMaterial({ color: h.Texture.toHex() });
        }
        else
            material = new THREE.MeshLambertMaterial({ color: 0x0f2f0f });

        let cube = new THREE.Mesh(geometry, material);
        cube.position.x = h.Bounds.Left;
        cube.position.y = h.Bounds.Top;
        cube.position.z = 3;
        return cube;
    }
}