import { ElementRef, Injectable, Renderer2 } from '@angular/core';
import { BaseModel, Point2D, Rectangle2D } from '../objects';
import { Clearable } from "./web-draw.service";
import * as THREE from "three";
import { FirstPersonControls } from "../controls";
import { Camera, Color, Scene } from 'three';

@Injectable()
export class WebGLService implements Clearable {

  private scene: THREE.Scene;
  private views: View[];
  //private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private miniMapRenderer: THREE.WebGLRenderer;


  private _renderingContext: any;
  private controls?: FirstPersonControls;
  public get Control():FirstPersonControls|undefined { return this.controls; }
  private clock: THREE.Clock = new THREE.Clock();

  private get gl(): WebGLRenderingContext {
    return this._renderingContext as WebGLRenderingContext;
  }

  public get Context() { return this.gl; }

  //public get Renderer(){ return this.renderer; }

  public get Scene() { return this.scene; }

  private textureLoader: THREE.TextureLoader;

  public get TextureLoader() { return this.textureLoader; }

  public get Views():View[]{ return this.views; }

  private maxWidth:number=0;
  private maxHeigth:number=0;
  private _isMap:boolean = false;
  public get isMap(){ return this._isMap;}

  constructor() {
    this.setInitSize();
    this.scene = new THREE.Scene();
    //let aspect = this.maxWidth / this.maxHeigth;
    //this.camera = new THREE.PerspectiveCamera(30, aspect, 1, 10000);

    this.renderer = new THREE.WebGL1Renderer({ antialias: true });
    this.renderer.setPixelRatio( window.devicePixelRatio );

    this.miniMapRenderer = new  THREE.WebGL1Renderer({ antialias: true });
    this.miniMapRenderer.setPixelRatio( window.devicePixelRatio );

    this.textureLoader = new THREE.TextureLoader();

    
    this.views = [
      new MainView({
        bounds: new Rectangle2D(new Point2D(0, 0), 1, 1),
        background: new THREE.Color( 0.5, 0.5, 0.5 ),
        eye: [0, 0, 5],
        up: [0, 0, 1],
        fov: 100
      } as IView, this.scene),
      new MiniMapView({
        bounds: new Rectangle2D(new Point2D(0.75, 0), 0.25, 0.25),
        background: new THREE.Color(0x0),
        eye: [0, 0, 500],
        up: [0, 1, 0],
        fov: 30
      } as IView, this.scene),
    ];
    
    this.controls = new FirstPersonControls(this.views[0].Camera, this.renderer.domElement);
    this.updateOnResize();
  }

  initialiseWebGLContext(canvas: HTMLCanvasElement) {
    this.renderer.domElement.id = "mainView";
    canvas.parentElement?.appendChild(this.renderer.domElement);
    canvas.parentElement?.removeChild(canvas);
    this.miniMapRenderer.domElement.id = "miniMap";    
    canvas.parentElement?.appendChild(this.miniMapRenderer.domElement)
      
    
    //
    let that = this;
    window.addEventListener('resize', function(){that.onWindowResize()});
  }

  initialiseWebGLCanvas() {
   
    // lights
    this.scene.add(new THREE.AmbientLight(0x666666));

    const light = new THREE.DirectionalLight(0xdfebff, 1);
    light.position.set(50, 200, 100);
    light.position.multiplyScalar(1.3);

    light.castShadow = true;

    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    const d = 300;

    light.shadow.camera.left = - d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = - d;

    light.shadow.camera.far = 10000;

    this.scene.add(light);

    // Ajout des axes pour aider a debugger
    const Xmaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );
    let pointsX = [new THREE.Vector3(200,0,0), new THREE.Vector3(-200,0,0)];
    let geomX = new THREE.BufferGeometry().setFromPoints(pointsX);
    let lineX = new THREE.Line(geomX, Xmaterial);
    this.scene.add(lineX);
    
    const Ymaterial = new THREE.LineBasicMaterial( { color: 0x00ff00 } );
    let pointsY = [new THREE.Vector3(0,200,0), new THREE.Vector3(0,-200,0)];
    let geomY = new THREE.BufferGeometry().setFromPoints(pointsY);
    let lineY = new THREE.Line(geomY, Ymaterial);
    this.scene.add(lineY);

    const Zmaterial = new THREE.LineBasicMaterial( { color: 0xff0000 } );
    let pointsZ = [new THREE.Vector3(0,0,200), new THREE.Vector3(0,0,-200)];
    let geomZ = new THREE.BufferGeometry().setFromPoints(pointsZ);
    let lineZ = new THREE.Line(geomZ, Zmaterial);
    this.scene.add(lineZ);
  }

  setInitSize(){
    this.maxWidth = window.innerWidth;
    this.maxHeigth =  window.innerHeight - 64;   
  }

  onWindowResize() {
    this.setInitSize();
    this.updateOnResize();
  }

  updateOnResize() {
    /*this.camera.aspect = this.maxWidth / this.maxHeigth;
    this.camera.updateProjectionMatrix();*/
    for(let c of this.views){
      if( c.Camera && c.Camera instanceof THREE.PerspectiveCamera) c.Camera.aspect = this.maxWidth / this.maxHeigth;
      if( c.Camera) c.Camera.updateMatrix();
    }
    this.renderer.setSize(this.maxWidth, this.maxHeigth);

    this.controls?.handleResize();
  }

  setWebGLCanvasDimensions(canvas: HTMLCanvasElement) {
    // set width and height based on canvas width and height - good practice to use clientWidth and clientHeight
    this.gl.canvas.width = canvas.clientWidth;
    this.gl.canvas.height = canvas.clientHeight - 70;
    // Récupération des dimensions de l'écran
    let maxWidth = window.innerWidth;
    let maxHeigth = window.innerHeight - 64;
    let ratioMax = maxWidth;
    if (maxWidth > maxHeigth) ratioMax = maxHeigth;
    if (ratioMax === 0) {
      this.gl.canvas.width = canvas.clientWidth;
      this.gl.canvas.height = canvas.clientHeight;
    }
    else {
      this.gl.canvas.width = maxWidth;
      this.gl.canvas.height = maxHeigth;
    }

  }

  private firstDrawCall = true;

  private _models3D?: BaseModel[]
  private render () {
    if( this._models3D){
      for(let mod of this._models3D){
        mod.Draw3D(this);
      }
    }
    this.controls?.update(this.clock.getDelta());
    //this.renderer.clear();

    for(let view of this.views){

      //view.updateCamera()
      const left = Math.floor(this.maxWidth * view.bounds.Left);
      const bottom = Math.floor(this.maxWidth * view.bounds.Top);
      const width = Math.floor(this.maxWidth * view.bounds.Width);
      const heigh = Math.floor(this.maxHeigth * view.bounds.Height);

      this.renderer.setViewport(left, bottom, width, heigh);
      this.renderer.setScissor(left, bottom, width, heigh);
      this.renderer.setScissorTest(true);
      this.renderer.setClearColor(view.background);
      this.renderer.clear();

      (view.Camera as THREE.PerspectiveCamera).updateProjectionMatrix();

      this.renderer.render(this.Scene, view.Camera);

    }
    
  }

  Draw(_models: BaseModel[]) {
    this._models3D = _models;
    
    if (this.firstDrawCall) {
      console.log('Calling Draw the first time');
      let animate = () => {
        requestAnimationFrame(animate);
        this.render();
      };

      this.firstDrawCall = false;
      animate();
      
    }
    else {
      console.log('Call to Draw another time');      
    }
    
  }

  clear() {
    this.scene.clear();
    this.initialiseWebGLCanvas();
    this.renderer.clear();
  }

  ngOnDestroy() {
    this.controls?.dispose();
    this.renderer.dispose();
  }
}


interface IView {
  aspect:number;
  bounds: Rectangle2D;
  background: THREE.Color;
  eye: number[];
  up: number[];
  fov: number;  
}

export abstract class View implements IView{
  abstract updateCamera(objet:BaseModel): void;
  abstract updateCamera(mouseX:number, mouseY:number):void;
  abstract updateCamera(mouseX?: number, mouseY?:number, objet?:BaseModel):void;

  private _cam: THREE.Camera;
  public get Camera(): Camera{ return this._cam;}
  public set Camera(value: Camera){ this._cam = value;}

  constructor(rawData: IView, scene: Scene){
    this.aspect = rawData.aspect;
    this.bounds = rawData.bounds;
    this.background = rawData.background;
    this.eye = rawData.eye;
    this.up = rawData.up;
    this.fov = rawData.fov;
    this._cam = new THREE.PerspectiveCamera(this.fov, this.aspect, 1, 10000);
    this.Camera.position.fromArray(this.eye);
    this.Camera.up.fromArray(this.up);
    scene.add(this.Camera);
    this.scene=scene;
  }

  aspect: number;
  bounds: Rectangle2D;
  background: THREE.Color;
  eye: number[];
  up: number[];
  fov: number;
  public scene;
}

export class MainView extends View{
  updateCamera(objet: BaseModel): void;
  updateCamera(mouseX: number, mouseY: number): void;
  updateCamera(mouseX?: number, mouseY?: number, objet?: BaseModel): void;
  updateCamera(mouseX?: any, mouseY?: any, objet?: any): void {
    throw new Error('Method not implemented.');
  }
  
}

export class MiniMapView extends View {
  updateCamera(objet: BaseModel): void;
  updateCamera(mouseX: number, mouseY: number): void;
  updateCamera(mouseX?: number, mouseY?: number, objet?: BaseModel): void;
  updateCamera(mouseX?: any, mouseY?: any, objet?: any): void {
    throw new Error('Method not implemented.');
  }
  
}