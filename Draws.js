(function ( global, factory ){

	typeof exports == "object" && typeof module !== 'undefined' ? factory( exports ) :
	typeof define === 'function' && define.amd ? define( ['exports'], factory ) :
	( global = global || self, factory( global.Draws = {}) );

}(this, function ( exports ){


	var ActiveCanvas = [];
	var ObjectRenderer = [];
	const PI = Math.PI;
	const DEFAULT_COLOR = "#000";

	window.Keys = {};
	window.Selection = 0;


	function DegToRad( ang ){

		return (ang*PI)/180;

	}

	function RadToDeg( ang ){

		return (180*ang)/PI;

	}

	function StyleIt ( Node, Par ){

		var k = Object.keys( Par );
		var v = Object.values( Par );
		for ( var a = 0; a < k.length; a++ ){

			Node.style[k[a]] = v[a];

		}

	}

	function Vector2( x=0, y=0 ){

		this.x = x;
		this.y = y;

		this.set = function( x, y ){

			this.x = x;
			this.y = y;

		}

		this.copy = function ( obj ){

			if ( obj.position ){

				this.x = obj.position.x;
				this.y = obj.position.y;

			}else{

				this.x = obj.x;
				this.y = obj.y;

			}

		}

	}

	class InitCanvas {

		constructor( w=300, h=300, color="#ffffff00", Parent=document.body ){

			if ( w == 0 || w == null ){ w = 300 };
			if ( h == 0 || h == null){ h = 300 };
			if ( color == 0 || color == null){ color = "#ffffff00" };

			this.CANVAS = document.createElement( 'canvas' );
			this.CTX = this.CANVAS.getContext( '2d' );
			this.CANVAS.width = w;
			this.CANVAS.height = h;
			this.width = w;
			this.height = h;
			this.Parent = Parent;
			this.Color = color;
			this.updateMatrix = function (){
				
				window.requestAnimationFrame( () => this.updateMatrix() );

				this.width = window.innerWidth;
				this.height = window.innerHeight;
				this.CANVAS.style.position = 'absolute';
				this.CANVAS.style.left = '0';
				this.CANVAS.style.top = '0';

			}

			ActiveCanvas.push( this );

			this.Attach ( );
			this.Paint ( );

			

		}
		Attach (){

			this.Parent.append( this.CANVAS );

		}

		Paint (){

			var Bkground = new Background( this.width/2, this.height/2, this.width, this.height );
			Bkground.color.fill = this.Color;

		}

	}

	function AddVisual ( i=0 ){

		if ( typeof i == 'array'){
			
			for ( var a = 0 ; a < i.length; a++ ){

				var g = ActiveCanvas[a];

				StyleIt(g.CANVAS, {
					"border" : "solid 1px #000"
				})

			}

		}else if ( typeof i == 'number'){

			var g = ActiveCanvas[i];

			StyleIt(g.CANVAS, {
					"border" : "solid 1px #000"
			})

		} else {

			let msg = (typeof i).slice(0,1).toUpperCase()+((typeof i).slice(1,(typeof i).length));
			console.error( "Draws.AddVisual : Cannot set index "+i+" of type "+msg+" at canvas");

		}


	}

	function SearchFromId( id ){

		for ( var a = 0; a < ObjectRenderer.length; a++ ){

			if ( ObjectRenderer[a].id == id ){

				return ObjectRenderer[a];

			}

		}

	}

	function Ball( x=0, y=0, r=1, render=true ){

		this.type = 'Ball';

		this.position = new Vector2( x, y );

		this.render = render;
		if ( this.render == undefined || this.render == null || this.render == 0){
			this.render = true;
		}

		this._r = r;
		this.ang = {
			ai: 0,
			af: PI*2
		}
		this.color = {
			fill: DEFAULT_COLOR,
			stroke: DEFAULT_COLOR
		};
		this.isFill = true;
		this.isStroke = false;
		this.line = {
			type: 'butt',
			width: 2
		}

		this.Grab = false;

		this.name;
		this.nameSet = function ( x ){

			this.name = x;
			new Text(this.name, null, this.position.x, this.position.y);

		}
		this.rotate = function( ang, i=0 ){
			 
			this.rotating = true;
			this.angle = ang;

		}

		this.remove = function(){
			
			for ( var a = 0; a < ObjectRenderer.length; a++ ){

				if ( ObjectRenderer[a] == this ){

					ObjectRenderer.splice( a, 1 );

				}

			}
		}

		this.StatusRender = function ( a ){

			if ( this.line ){
				a.lineWidth = this.line.width;
				a.lineCap = this.line.type;
			}

			a.arc( this.position.x, this.position.y, this._r, this.ang.ai, this.ang.af );

			if ( this.isFill ){a.fill();}
			if ( this.isStroke ){a.stroke();}

			if ( this.Grab ){
				var allowToGrab = false;
				var holdingBall = false;

				var obj = this;

				ActiveCanvas[0].CANVAS.addEventListener( 'mousemove', function (e){
					var mx = e.offsetX;
					var my = e.offsetY;
					var hypon = {
						x: Math.abs( obj.position.x - mx ),
						y: Math.abs( obj.position.y - my ),
						hyp: function (){return Math.sqrt( this.x**2 + this.y**2 );},
						isInside: function(){ 
							if ( this.hyp() <= obj._r ){ 
								allowToGrab = true; 
							}else{ 
								allowToGrab = false; 
							} 
						}
					}
					
					hypon.isInside();

					if ( holdingBall ){
						var distanceX = obj.position.x - mx;
						var distanceY = obj.position.y - my;

						obj.position.x -= distanceX;
						obj.position.y -= distanceY;

					}

				})
				ActiveCanvas[0].CANVAS.addEventListener( 'mousedown', function (){
					if ( allowToGrab ){
						holdingBall = true;
					}
				})
				ActiveCanvas[0].CANVAS.addEventListener( 'mouseup', function (){
					if ( allowToGrab ){
						holdingBall = false;
					}
				})
			}


		}

		if ( this.render ){ ObjectRenderer.push( this ); }

	}


	function Background( x=0, y=0, w=1, h=1, render=true ){

		this.type = 'Square';

		this.position = new Vector2( x, y );

		this.origin = new Vector2( 0, 0 );
		this.rotating = false;

		this.render = render;
		if ( this.render == undefined || this.render == null || this.render == 0){
			this.render = true;
		}

		this._w = w;
		this._h = h;
		this.color = {
			fill: DEFAULT_COLOR,
			stroke: DEFAULT_COLOR
		};
		this.isFill = true;
		this.isStroke = false;
		this.line = {
			type: 'butt',
			width: 2
		}
		this.canvasRendering = ActiveCanvas[0].CTX;
		this.angle = DegToRad(0);

		this.name;
		this.nameSet = function ( x ){

			this.name = x;
			this.canvasRendering.textAlign = 'center';
			new Text(this.name, "bold 15px Arial", this.position.x, this.position.y);

		}
		this.rotate = function( ang, i=0 ){
			 
			this.rotating = true;
			this.angle = ang;

		}

		this.remove = function(){
			
			for ( var a = 0; a < ObjectRenderer.length; a++ ){

				if ( ObjectRenderer[a] == this ){

					ObjectRenderer.splice( a, 1 );

				}

			}
		}

		this.StatusRender = function ( a ){

			this.canvasRendering = a;

			if ( this.line ){
				a.lineWidth = this.line.width;
				a.lineCap = this.line.type;
			}

			if ( !this.rotating ){
			
				if ( this.isFill ){a.fillRect( this.position.x-(this._w/2), this.position.y-(this._h/2), this._w, this._h );}
				if ( this.isStroke ){ a.strokeRect( this.position.x-(this._w/2), this.position.y-(this._h/2), this._w, this._h );}

			}else{

				a.save();

				a.translate(this.position.x, this.position.y);
				a.rotate( this.angle );

				if ( this.isFill ){a.fillRect( this.origin.x-(this._w/2), this.origin.y-(this._h/2), this._w, this._h );}
				if ( this.isStroke ){ a.strokeRect( this.origin.x-(this._w/2), this.origin.y-(this._h/2), this._w, this._h );}				

				a.restore();

			}
		}

		if ( this.render ){ ObjectRenderer.push( this ); }

	}

	function Square( x=0, y=0, w=1, h=1, render=true ){

		this.type = 'Square';

		this.position = new Vector2( x, y );

		this.origin = new Vector2( 0, 0 );
		this.rotating = false;

		this.render = render;
		if ( this.render == undefined || this.render == null || this.render == 0){
			this.render = true;
		}

		this._w = w;
		this._h = h;
		this.color = {
			fill: DEFAULT_COLOR,
			stroke: DEFAULT_COLOR
		};
		this.isFill = true;
		this.isStroke = false;
		this.line = {
			type: 'butt',
			width: 2
		}

		this.Grab = false;

		this.canvasRendering = ActiveCanvas[0].CTX;
		this.angle = DegToRad(0);

		this.name;
		this.nameSet = function ( x ){

			this.name = x;
			this.canvasRendering.textAlign = 'center';
			new Text(this.name, "bold 15px Arial", this.position.x, this.position.y);

		}
		this.rotate = function( ang, i=0 ){
			 
			this.rotating = true;
			this.angle = ang;

		}

		this.remove = function(){
			
			for ( var a = 0; a < ObjectRenderer.length; a++ ){

				if ( ObjectRenderer[a] == this ){

					ObjectRenderer.splice( a, 1 );

				}

			}
		}

		this.StatusRender = function ( a ){

			this.canvasRendering = a;

			if ( this.line ){
				a.lineWidth = this.line.width;
				a.lineCap = this.line.type;
			}

			if ( !this.rotating ){
			
				if ( this.isFill ){a.fillRect( this.position.x-(this._w/2), this.position.y-(this._h/2), this._w, this._h );}
				if ( this.isStroke ){ a.strokeRect( this.position.x-(this._w/2), this.position.y-(this._h/2), this._w, this._h );}

			}else{

				a.save();

				a.translate(this.position.x, this.position.y);
				a.rotate( this.angle );

				if ( this.isFill ){a.fillRect( this.origin.x-(this._w/2), this.origin.y-(this._h/2), this._w, this._h );}
				if ( this.isStroke ){ a.strokeRect( this.origin.x-(this._w/2), this.origin.y-(this._h/2), this._w, this._h );}				

				a.restore();

			}


			if ( this.Grab ){
				var allowToGrab = false;
				var holdingBall = false;

				var obj = this;

				ActiveCanvas[0].CANVAS.addEventListener( 'mousemove', function (e){
					var mx = e.offsetX;
					var my = e.offsetY;


					if ( ( mx >= obj.position.x - obj._w/2 && mx <= obj.position.x + obj._w/2 ) &&
						( my >= obj.position.y - obj._h/2 && my <= obj.position.y + obj._h/2 )){
						
						allowToGrab = true;

					}else{
						allowToGrab = false;
					}


					if ( holdingBall ){
						var distanceX = obj.position.x - mx;
						var distanceY = obj.position.y - my;

						obj.position.x -= distanceX;
						obj.position.y -= distanceY;

					}

				})
				ActiveCanvas[0].CANVAS.addEventListener( 'mousedown', function (){
					if ( allowToGrab ){
						holdingBall = true;
					}
				})
				ActiveCanvas[0].CANVAS.addEventListener( 'mouseup', function (){
					if ( allowToGrab ){
						holdingBall = false;
					}
				})
			}

		}

		if ( this.render ){ ObjectRenderer.push( this ); }

	}

	function getHighValue ( arr, axis ){

		var maximumValue = 0

		if ( axis.toUpperCase() == 'X' ){

			for ( var a = 0; a < arr.length; a+=2 ){

				if ( a == 0 ){
					maximumValue = arr[a];
				}
				if ( arr[a] >= maximumValue ){

					maximumValue = arr[a];

				}

			}

		}else{

			for ( var a = 1; a < arr.length; a+=2 ){

				if ( a == 1 ){
					maximumValue = arr[a];
				}
				if ( arr[a] >= maximumValue ){

					maximumValue = arr[a];

				}

			}

		}

		return maximumValue;

	}
	function getLowValue ( arr, axis ){

		var minimumValue = 0
		if ( axis.toUpperCase() == 'X' ){

			for ( var a = 0; a < arr.length; a+=2 ){

				if ( a == 0 ){
					minimumValue = arr[a];
				}
				if ( arr[a] >= minimumValue ){

					minimumValue = arr[a];

				}

			}

		}else{

			for ( var a = 1; a < arr.length; a+=2 ){

				if ( a == 1 ){
					minimumValue = arr[a];
				}
				if ( arr[a] >= minimumValue ){

					minimumValue = arr[a];

				}

			}

		}

		return minimumValue;

	}

	/*function PositioningLine( objLine, posX, posY ){

		try{
			if ( objLine.type == "Line" ){ throw 'type of object need to be \"line\"' }






		}catch( e ){

			console.error( "Draws - PositioningLine: "+e );

		}

	}*/


	function Line ( coords, render=true ) {

		this.type = 'Line';

		this.Coords = [];

		this.coords = coords;

		for ( var a = 0; a < coords.length; a+=2 ){

			this.Coords.push( [coords[a], coords[a+1] ] );

		}

		this.render = render;
		if ( this.render == undefined || this.render == null || this.render == 0){
			this.render = true;
		}

		this.close = false;
		this.color = {
			fill: DEFAULT_COLOR,
			stroke: DEFAULT_COLOR
		}
		this.isFill = false;
		this.isStroke = true;
		this.line = {
			type: 'butt',
			width: 2
		}
		this.name;
		this.nameSet = function ( x ){

			this.name = x;

		}

		this.MiddlePoint = function( arr ){

			var x = 'x';var y = 'y';
			var max = [ getHighValue( arr, x ), getHighValue( arr, y ) ]
			var min = [ getLowValue( arr, x ), getLowValue( arr, y ) ]

			this.x = Math.abs( max[0] - min[0] ) / 2;
			this.y = Math.abs( max[1] - min[1] ) / 2;

		}

		this.position = new this.MiddlePoint( this.coords );

		this.remove = function(){
			
			for ( var a = 0; a < ObjectRenderer.length; a++ ){

				if ( ObjectRenderer[a] == this ){

					ObjectRenderer.splice( a, 1 );

				}

			}
		}

		this.StatusRender = function ( a ){

			if ( this.line ){
				a.lineWidth = this.line.width;
				a.lineCap = this.line.type;
			}

			for ( var z = 0; z < this.Coords.length; z++ ){

				if ( z == 0 ){ 

					if ( this.Coords[0][0].type == "Bezier" ){

						this.Coords[0][0].StatusRender( a );

					}else{

						a.moveTo( this.Coords[0][0], this.Coords[0][1]); 

					}


				}
				else { 

					if ( this.Coords[z][0].type == "Bezier" ){

						this.Coords[z][0].StatusRender( a );

					}else{

						a.lineTo( this.Coords[z][0], this.Coords[z][1] ); 

					}

				}

			}

			if ( this.close ){
				a.lineTo( this.Coords[0][0], this.Coords[0][1] );	
			}
			


			if ( this.isFill ) { a.fill(); }
			if ( this.isStroke ) { a.stroke(); }


		}

		if ( this.render ){ ObjectRenderer.push( this ); }

	}

	function Bezier( coords, render=true ){

		this.type = 'Bezier';

		this.Coords = [];

		for ( var a = 0; a < coords.length; a+=2 ){

			this.Coords.push( [ coords[a], coords[a+1] ] );

		}

		this.render = render;
		if ( this.render == undefined || this.render == null || this.render == 0){
			this.render = true;
		}

		this.color = {
			fill: DEFAULT_COLOR,
			stroke: DEFAULT_COLOR
		}
		this.isFill = false;
		this.isStroke = true;
		this.line = {
			type: 'butt',
			width: 2
		}
		this.name;
		this.nameSet = function ( x ){

			this.name = x;

		}

		this.remove = function(){
			
			for ( var a = 0; a < ObjectRenderer.length; a++ ){

				if ( ObjectRenderer[a] == this ){

					ObjectRenderer.splice( a, 1 );

				}

			}
		}

		this.Helper = function ( ){
			window.requestAnimationFrame( () => this.Helper() );

			window.onkeydown = e=>{

				if ( e.keyCode == 49 || e.keyCode == 50 || e.keyCode == 51 || e.keyCode == 52 ){

					if ( e.shiftKey && e.ctrlKey ){

						window.Selection = parseInt(e.code.slice(e.code.length-1, e.code.length)) - 1;

					}

				}else{

					window.Keys[e.keyCode] = true;

				}

				if ( e.keyCode == 13 ){

					console.warn( "Draws.Bezier.Helper : Bezier Positions: ");
					console.table( this.Coords );

				}
				
			}
			window.onkeyup = e=>{
				window.Keys[e.keyCode] = false;
			}

			if ( window.Keys[ 37 ] ){	
				this.Coords[window.Selection][0] -= 1;
			}if ( window.Keys[ 38 ] ){	
				this.Coords[window.Selection][1] -= 1;
			}if ( window.Keys[ 39 ] ){	
				this.Coords[window.Selection][0] += 1;
			}if ( window.Keys[ 40 ] ){	
				this.Coords[window.Selection][1] += 1;
			}



			var pointH = new Array(this.Coords.length);
			var order = [ '#f00', '#0f0', '#00f', "#888" ];

			if ( !this.PointHelpers ){

				for ( var a = 0; a < pointH.length; a++ ){

					pointH[a] = new Ball( this.Coords[a][0], this.Coords[a][1], 3 );
					pointH[a].color.fill = order[a];
					pointH[a].color.isFill = true;

				}

				this.PointHelpers = pointH;

			}
			else{

				for ( var a = 0; a < this.PointHelpers.length; a++ ){

					this.PointHelpers[a].position.x = this.Coords[a][0];
					this.PointHelpers[a].position.y = this.Coords[a][1];

				}

			}
			

		}

		this.StatusRender = function ( a ){

			if ( this.line ){
				a.lineWidth = this.line.width;
				a.lineCap = this.line.type;
			}

			for ( var b = 0; b < this.Coords.length; b+=4 ){

				if ( b == 0 ) { 
					a.moveTo( this.Coords[b][0], this.Coords[b][1] ); 
					a.bezierCurveTo( 

					this.Coords[b+1][0], this.Coords[b+1][1],

					this.Coords[b+2][0], this.Coords[b+2][1],

					this.Coords[b+3][0], this.Coords[b+3][1],

				); }

			}


			if ( this.isFill ) { a.fill(); }
			if ( this.isStroke ) { a.stroke(); }

		}

		if ( this.render ){ ObjectRenderer.push( this ); }


	}

	function Text( text, font="30px Arial", x=0, y=0, render=true ){

		if ( text == null || text == undefined ) { text = new String(); }
		if ( font == 0 || font == null ){ font = '30px Arial'; }

		this.type = 'Text';

		this.text = text;

		this.font = font;

		this.position = new Vector2( x, y );

		this.render = render;
		if ( this.render == undefined || this.render == null || this.render == 0){
			this.render = true;
		}

		this.color = {
			fill: DEFAULT_COLOR,
			stroke: DEFAULT_COLOR
		}
		this.isFill = true;
		this.isStroke = false;
		this.line = {
			type: 'butt',
			width: 2
		}
		this.name;
		this.nameSet = function ( x ){

			this.name = x;

		}

		this.remove = function(){
			
			for ( var a = 0; a < ObjectRenderer.length; a++ ){

				if ( ObjectRenderer[a] == this ){

					ObjectRenderer.splice( a, 1 );

				}

			}
		}

		this.StatusRender = function ( a ){

			if ( this.line ){
				a.lineWidth = this.line.width;
				a.lineCap = this.line.type;
			}

			a.font = this.font;

			if ( this.isFill ) { a.fillText( this.text, this.position.x, this.position.y ); }
			if ( this.isStroke ) { a.strokeText( this.text, this.position.x, this.position.y ); }


		}

		if ( this.render ){ ObjectRenderer.push( this ); }

	}

	function ImageFill( path="//", x=0, y=0, render=true ){

		this.type = "Image";

		//IMGC Types - ( P ):Positioning ( R ):Resizing ( C ):Cuting
		this.ImageProperties = {
			Cx: false,
			Cy: false,
			Cw: false,
			Ch: false,
			x: false,
			y: false,
			Rw: false,
			Rh: false
		}

		this.position = new Vector2( x, y );

		this.render = render;
		if ( this.render == undefined || this.render == null || this.render == 0){
			this.render = true;
		}

		this.ImageProperties.x = this.position.x;
		this.ImageProperties.y = this.position.y;

		this.Resize = function ( w, h ){

			this.ImageProperties.Rw = w;
			this.ImageProperties.Rh = h;

		}

		this.Cut = function ( x, y, w, h ){

			this.ImageProperties.Cx = x;
			this.ImageProperties.Cy = y;
			this.ImageProperties.Cw = w;
			this.ImageProperties.Ch = h;

		}

		this.path = path;

		this.img = new Image();
		this.img.src = this.path;

		this.name;
		this.nameSet = function ( x ){

			this.name = x;

		}

		if ( this.path == undefined || this.path == "//" ){ console.warn( "Draws.Image : It's necessary to set path to image for its rendering" ); }

		this.remove = function(){
			
			for ( var a = 0; a < ObjectRenderer.length; a++ ){

				if ( ObjectRenderer[a] == this ){

					ObjectRenderer.splice( a, 1 );

				}

			}
		}

		this.StatusRender = function ( a ){

			this.ImageProperties.x = this.position.x;
			this.ImageProperties.y = this.position.y;

			if ( this.ImageProperties.Rw  || this.ImageProperties.Cx ){
				if ( this.ImageProperties.Cx ){

					a.drawImage( this.img, this.ImageProperties.Cx, this.ImageProperties.Cy, this.ImageProperties.Cw, this.ImageProperties.Ch, this.ImageProperties.x, this.ImageProperties.y, this.ImageProperties.Rw, this.ImageProperties.Rh );

				}else{

					a.drawImage( this.img, this.ImageProperties.x, this.ImageProperties.y, this.ImageProperties.Rw, this.ImageProperties.Rh );
				}
			}else {

				a.drawImage( this.img, this.ImageProperties.x, this.ImageProperties.y );	

			}
			
		}

		if ( this.render ){ ObjectRenderer.push( this ); }

	}


	function Render ( i=0 ){

		this.i = i;

		this.path = function ( f, obj ){

			ActiveCanvas[this.i].CTX.beginPath();

			f( ActiveCanvas[this.i].CTX, obj );

			ActiveCanvas[this.i].CTX.closePath();

		}

		this.renderHelper = function ( a, b ){

			if ( b.type != "Image" ){

				a.fillStyle = b.color.fill;
				a.strokeStyle = b.color.stroke;

			}

			b.StatusRender( a, b );

		}
		
		for ( var z = 0; z < ObjectRenderer.length; z++ ){

			this.path( this.renderHelper, ObjectRenderer[z] );

		}

	}

	function ClearCanvas (){

		for ( var z = 0; z < ActiveCanvas.length; z++ ){

			var cnv = ActiveCanvas[z];
			cnv.CTX.clearRect( 0, 0, cnv.CANVAS.width, cnv.CANVAS.height);
			cnv.CANVAS.width = cnv.width-2;
			cnv.CANVAS.height = cnv.height-2;

		}

	}


	exports.ActiveCanvas = ActiveCanvas;
	exports.AddVisual = AddVisual;
	exports.Ball = Ball;
	exports.Bezier = Bezier;
	exports.ClearCanvas = ClearCanvas;
	exports.DegToRad = DegToRad;
	exports.ImageFill = ImageFill;
	exports.InitCanvas = InitCanvas;
	exports.Line = Line;
	exports.ObjectRenderer = ObjectRenderer;
	exports.Render = Render;
	exports.RadToDeg = RadToDeg;
	exports.SearchFromId = SearchFromId;
	exports.Square = Square;
	exports.Text = Text;
	exports.Vector2 = Vector2;

	exports.Background = Background;
	
	
	

}))