import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { MazeService } from "./maze.service";
import { SceneService } from "../scene/services/scene.service";
import { ActivatedRoute } from "@angular/router";
import { ModelEvents,HeroWinEvent } from "../models/ModelEvents";
import { PersoHero } from '../models';




@Component({
  selector: 'app-nav-bar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  providers: [MazeService, SceneService]
})

export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
 
  public showButtons:boolean = true;
  private winSubscribe:any;

  constructor(private breakpointObserver: BreakpointObserver, private mazeService: MazeService, private scene: SceneService, private route: ActivatedRoute, private elementRef:ElementRef) {
    route.paramMap.pipe(switchMap(params =>{
      console.log(params);
      return "0";
    }));
  }
  ngOnDestroy(): void {
    if( this.winSubscribe){this.winSubscribe.unsubscribe(); }
  }

  ngOnInit(): void {
    if( this.winSubscribe){this.winSubscribe.unsubscribe(); }
    this.winSubscribe = ModelEvents.WinEmitter.subscribe((heroEvt:HeroWinEvent) =>{
      alert("Bravo !! Vous avez " + (heroEvt.Personnage as PersoHero).Score + " points");
      this.reset();
    });
  }

  ngAfterViewInit(){
    console.log(this.elementRef.nativeElement.firstElementChild.clientHeight);
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  private _lines: number = MazeService.DEFAULT_LINES;
  private _columns: number = MazeService.DEFAULT_COLUMNS;

  reset() {
    this.mazeService.GenerateMaze(this.Columns, this.Lignes).then(() => { this.scene.initializeAndDraw(); });
  }

  @Input() public get Columns() { return this._columns; }
  public set Columns(value: number) {
    if (value > 0 && value < 1000) {
      this._columns = value;
      //this.reset();
    }
  }

  @Input() public get Lignes() { return this._lines; }
  public set Lignes(value: number) {
    if (value > 0 && value < 1000) {
      this._lines = value;
      //this.reset();
    }
  }

  left() {
    this.mazeService.Hero?.MoveLeft();
    this.scene.Draw();
  }

  up() {
    this.mazeService.Hero?.MoveUp();
    this.scene.Draw();
  }

  right() {
    this.mazeService.Hero?.MoveRight();
    this.scene.Draw();
  }

  down() {
    this.mazeService.Hero?.MoveDown();
    this.scene.Draw();
  }

  prevent(event:Event) {
      if( event) {
        event.preventDefault();
      }
  }
}
