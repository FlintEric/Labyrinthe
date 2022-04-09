import {
	Camera,
	MathUtils,
	Mesh,
	Spherical,
	Vector3
} from 'three';

const _lookDirection = new Vector3();
const _spherical = new Spherical();
const _target = new Vector3();

let _onMouseMove: any, _onMouseDown: any, _onMouseUp: any, _onKeyDown: any, _onKeyUp: any;
function contextmenu(event: Event) {
	event.preventDefault();
}

export class FirstPersonControls {

	// API
	public enabled: boolean = true;
	public movementSpeed: number;
	public lookSpeed: number;
	public lookVertical: boolean;
	public autoForward: boolean;
	public activeLook: boolean;
	public heightSpeed: boolean;
	public heightCoef: number;
	public heightMin: number;
	public heightMax: number;

	public constrainVertical: boolean;
	public verticalMin: number;
	public verticalMax: number;
	public mouseDragOn: boolean;

	protected autoSpeedFactor: number;

	protected mouseX: number;
	protected mouseY: number;

	protected moveForward: boolean;
	protected moveBackward: boolean;
	protected moveLeft: boolean;
	protected moveRight: boolean;
	protected moveUp: boolean;
	protected moveDown: boolean;

	protected viewHalfX: number;
	protected viewHalfY: number;

	private lat: number = 0;
	private lon: number = 0;

	private object:(Camera | Mesh)[];

	constructor(object: Camera | (Camera | Mesh)[], private domElement?: any) {
		if (domElement === undefined) {
			console.warn('THREE.FirstPersonControls: The second Parameter "domElement" is now mandatory.');
			this.domElement = document;
		}
		if( object instanceof Camera){
			this.object = [object];
		}else{
			this.object = object;
		}

		this.movementSpeed = 1.0;
		this.lookSpeed = 0.005;
		this.lookSpeed = 1;
		this.lookVertical = true;
		this.autoForward = false;

		this.activeLook = true;

		this.heightSpeed = false;
		this.heightCoef = 1.0;
		this.heightMin = 0.0;
		this.heightMax = 1.0;

		this.constrainVertical = false;
		this.verticalMin = 0;
		this.verticalMax = Math.PI;

		this.mouseDragOn = false;

		this.autoSpeedFactor = 0.0;

		this.mouseX = 0;
		this.mouseY = 0;

		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;
		this.moveUp = false;
		this.moveDown = false;


		this.viewHalfX = 0;
		this.viewHalfY = 0;
		//_onMouseMove = this.onmousemove.bind(this);
		//_onMouseDown = this.onmousedown.bind(this);
		//_onMouseUp = this.onmouseup.bind(this);
		_onKeyDown = this.onkeydown.bind(this);
		_onKeyUp = this.onkeyup.bind(this);

		//this.domElement.addEventListener('contextmenu', contextmenu);
		//this.domElement.addEventListener('mousemove', _onMouseMove);
		//this.domElement.addEventListener('mousedown', _onMouseDown);
		//this.domElement.addEventListener('mouseup', _onMouseUp);

		window.addEventListener('keydown', _onKeyDown);
		window.addEventListener('keyup', _onKeyUp);

		this.handleResize();

		this.setOrientation(this);
	}

	handleResize() {
		if (this.domElement === document) {
			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;
		} else {
			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;
		}
	}

	onmousedown(event: MouseEvent) {
		if (this.domElement !== document) {
			this.domElement.focus();
		}
		event.preventDefault();
		if (this.activeLook) {
			switch (event.button) {
				case 0: this.moveForward = true; break;
				case 2: this.moveBackward = true; break;
			}
		}
		this.mouseDragOn = true;
	}

	onmouseup(event: MouseEvent) {
		event.preventDefault();
		if (this.activeLook) {
			switch (event.button) {
				case 0: this.moveForward = false; break;
				case 2: this.moveBackward = false; break;
			}
		}

		this.mouseDragOn = false;
	}

	onmousemove(event: MouseEvent) {
		if (this.domElement === document) {

			this.mouseX = event.pageX - this.viewHalfX;
			this.mouseY = event.pageY - this.viewHalfY;

		} else {

			this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
			this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

		}
	}

	onkeydown(event: KeyboardEvent) {
		//event.preventDefault();

		switch (event.code) {

			case 'ArrowUp':
			case 'KeyZ': this.moveForward = true; break;

			case 'ArrowLeft':
			case 'KeyQ': this.moveLeft = true; break;

			case 'ArrowDown':
			case 'KeyS': this.moveBackward = true; break;

			case 'ArrowRight':
			case 'KeyD': this.moveRight = true; break;

			case 'KeyR': this.moveUp = true; break;
			case 'KeyF': this.moveDown = true; break;

		}
	}

	onkeyup(event: KeyboardEvent) {
		switch (event.code) {

			case 'ArrowUp':
			case 'KeyZ': this.moveForward = false; break;

			case 'ArrowLeft':
			case 'KeyQ': this.moveLeft = false; break;

			case 'ArrowDown':
			case 'KeyS': this.moveBackward = false; break;

			case 'ArrowRight':
			case 'KeyD': this.moveRight = false; break;

			case 'KeyR': this.moveUp = false; break;
			case 'KeyF': this.moveDown = false; break;

		}
	}

	lookAt(x: Vector3 | number, y?: number, z?: number) {
		if (x instanceof Vector3) {
			_target.copy(x);
		} else {
			_target.set(x, y ? y : 0, z ? z : 0);
		}

		//this.object.lookAt(_target);
		for(let obj of this.object){
			obj.lookAt(_target);
		}
		this.setOrientation(this);
		return this;
	}


	private targetPosition = new Vector3();

	update(delta: number) {
		const that = this;
		if (that.enabled === false) return;
		if (that.heightSpeed) {
			const y = MathUtils.clamp(that.object[0].position.y, that.heightMin, that.heightMax);
			const heightDelta = y - that.heightMin;

			that.autoSpeedFactor = delta * (heightDelta * that.heightCoef);
		} else {
			that.autoSpeedFactor = 0.0;
		}

		const actualMoveSpeed = delta * that.movementSpeed;

		if (that.moveForward || (that.autoForward && !that.moveBackward)) {
			for (let obj of that.object)
				obj.translateZ(- (actualMoveSpeed + that.autoSpeedFactor));
		}
		if (that.moveBackward)
			for (let obj of that.object)
				obj.translateZ(actualMoveSpeed);

		if (that.moveLeft)
			for (let obj of that.object)
				obj.translateX(- actualMoveSpeed);
		if (that.moveRight)
			for (let obj of that.object)
				obj.translateX(actualMoveSpeed);

		if (that.moveUp)
			for (let obj of that.object)
				obj.translateY(actualMoveSpeed);
		if (that.moveDown)
			for (let obj of that.object)
				obj.translateY(- actualMoveSpeed);

		let actualLookSpeed = delta * that.lookSpeed;

		if (!that.activeLook) {
			actualLookSpeed = 0;
		}

		let verticalLookRatio = 1;

		if (that.constrainVertical) {

			verticalLookRatio = Math.PI / (that.verticalMax - that.verticalMin);

		}

		/*that.lon -= that.mouseX * actualLookSpeed;
		if (that.lookVertical) that.lat -= that.mouseY * actualLookSpeed * verticalLookRatio;

		that.lat = Math.max(- 85, Math.min(85, that.lat));
*/
		let phi = MathUtils.degToRad(90 - that.lat);
		const theta = MathUtils.degToRad(that.lon);

		if (that.constrainVertical) {

			phi = MathUtils.mapLinear(phi, 0, Math.PI, that.verticalMin, that.verticalMax);

		}
		
		const position = that.object[0].position;

		this.targetPosition.setFromSphericalCoords(1, phi, theta).add(position);

		for(let obj of that.object)
				obj.lookAt(this.targetPosition);
	};


	dispose() {
		this.domElement.removeEventListener('contextmenu', contextmenu);
		this.domElement.removeEventListener('mousedown', _onMouseDown);
		this.domElement.removeEventListener('mousemove', _onMouseMove);
		this.domElement.removeEventListener('mouseup', _onMouseUp);

		window.removeEventListener('keydown', _onKeyDown);
		window.removeEventListener('keyup', _onKeyUp);
	}

	private setOrientation(controls: any) {
		const quaternion = controls.object[0].quaternion;

		_lookDirection.set(0, 0, - 1).applyQuaternion(quaternion);
		_spherical.setFromVector3(_lookDirection);

		this.lat = 90 - MathUtils.radToDeg(_spherical.phi);
		this.lon = MathUtils.radToDeg(_spherical.theta);
	}

	addObjectToControl(object: Camera | Mesh){
		this.object.push(object);
	}
}


