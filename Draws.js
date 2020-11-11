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

	function TurnToOperator( op, opds ){
		let oper;
		switch (op){
			case "+":
				oper = opds[0] + opds[1];
			break;
			case "-":
				oper = opds[0] - opds[1];
			break;
			case "*":
				oper = opds[0] * opds[1];
			break;
			case "/":
				oper = opds[0] / opds[1];
			break;
		}

		return oper;
	}


	function RenderThis( obj ){

		ObjectRenderer.push( obj );

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

	function InjectPositionRender( i=1, obj, s=null ){

		if ( s != null ) console.log(s);

		if ( i == 0 ){ i = 1; };
		if ( i == "L" ){ i = 1; };
		if ( i == "F" ){ i = ObjectRenderer.length-1; };


		let ind = 0;
		let hasObj = false
		for ( var a = 0; a < ObjectRenderer.length; a++ ){
			if ( ObjectRenderer[a] == obj ){
				hasObj = true;
				ind = a;
				break;
			}
		}

		if ( hasObj ){

			ObjectRenderer.splice( ind, 1 );
			ObjectRenderer.splice( i, 0, obj );

		}else{

			//console.warn("Error InjectPositionRender: Nao ha o objeto referido no array de renderizacao");

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
			this.Bkground;
			this.updateMatrix = function (){
				
				window.requestAnimationFrame( () => this.updateMatrix() );

				this.width = window.innerWidth+2;
				this.height = window.innerHeight+2;
				this.CANVAS.style.position = 'absolute';
				this.CANVAS.style.left = '0';
				this.CANVAS.style.top = '0';

				for ( var i = 0; i < ObjectRenderer.length; i++ ){
					if ( ObjectRenderer[i] == this.Bkground ){
						ObjectRenderer[i]._w = this.width;
						ObjectRenderer[i]._h = this.height;
						ObjectRenderer[i].position.x = this.width/2;
						ObjectRenderer[i].position.y = this.height/2;
					}
				}

			}

			ActiveCanvas.push( this );

			this.Attach ( );
			this.Paint ( );

			

		}
		Attach (){

			this.Parent.append( this.CANVAS );

		}

		Paint (){

			this.Bkground = new Background( this.width/2, this.height/2, this.width, this.height );
			this.Bkground.color.fill = this.Color;

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

	function Ball( x=0, y=0, r=1, render=true, style={} ){

		this.type = 'Ball';

		this.position = new Vector2( x, y );

		this.origin = new Vector2( 0, 0 );
		this.rotating = false;
		this.angle = DegToRad(0);

		this.render = render;

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

		for ( var i = 0; i < Object.keys(style).length; i++ ){
			let key = Object.keys(style)[i];
			let val = Object.values(style)[i];

			if ( typeof val == "object" ){
				for ( var ii = 0; ii < Object.keys(val).length; ii++ ){
					let key2 = Object.keys(val)[ii];
					let val2 = Object.values(val)[ii];

					this[ key ][ key2 ] = val2;
				}
			}else{
				this[ key ] = val;
			}

		}

		this.strokeIt = function (){
			this.isStroke = true;
		}
		this.fillIt = function (){
			this.isFill = true;
		}
		this.strokeOnly = function (){
			this.isFill = false;
			this.isStroke = true;
		}
		this.fillOnly = function (){
			this.isFill = true;
			this.isStroke = false;
		}

		this.name = {};
		this.nameSet = function ( x, align='center', edit={} ){

			this.name.text = x;
			this.name.align = align;
			this.name.render = new Text(this.name.text, "bold 15px Arial", this.position.x, this.position.y, true, this.name.align);

			let len = Object.keys(edit).length;
			for ( var i = 0; i < len; i++ ){
				let k = Object.keys(edit)[i];
				let v = Object.values(edit)[i];

				if ( typeof v == "object" ){
					for ( var ii = 0; ii < Object.keys(v).length; ii++ ){
						let k2 = Object.keys(v)[ii];
						let v2 = Object.values(v)[ii];

						if ( k2 == "x" || k2 == "y" ){
							if ( typeof edit[ k ][ k2 ] == "string" ){
								let sub = v2;
								let operation = sub[0];
								let construct = parseInt(sub.slice( sub.indexOf("|")+1, sub.length ) );

								this.name.render[ k ][ k2 ] = TurnToOperator( operation, [ this.name.render[ k ][ k2 ], construct ] );
							}else{
								this.name.render[ k ][ k2 ] = v2;
							}	
						}else{

							this.name.render[ k ][ k2 ] = v2;

						}

					}
				}else{
					if ( k == "_w" || k == "_h"){
						if ( typeof edit[ k ] == "string" ){
							let sub = edit[v];
							let operation = sub[0];
							let construct = parseInt(sub.slice( sub.indexOf("|")+1, sub.length ) );

							this.name.render[ k ] = TurnToOperator( operation, [ this.name.render[ k ], construct ] );

						}	
					}
					this.name.render[ k ] = v;

				}

			}

		}

		this.rotate = function( ang, i=0 ){
			 
			this.rotating = true;
			this.angle = ang;

		}
		this.Render = function(){

			this.render = true;
			let renderNow = true;
			for ( var a = 0; a < ObjectRenderer.length; a++ ){
				if ( ObjectRenderer[a] == this ){
					renderNow = false;
				}
			}
			if ( renderNow ){
				ObjectRenderer.push(this);
			}
			
		}

		this.remove = function(){
			
			for ( var a = 0; a < ObjectRenderer.length; a++ ){

				if ( ObjectRenderer[a] == this ){

					ObjectRenderer.splice( a, 1 );

				}

			}
			this.render = false;
		}

		this.StatusRender = function ( a ){

			if ( this.line ){
				a.lineWidth = this.line.width;
				a.lineCap = this.line.type;
			}

			

			if ( !this.rotating ){
			
				a.arc( this.position.x, this.position.y, this._r, this.ang.ai, this.ang.af );

			}else{

				a.save();

				a.translate(this.position.x, this.position.y);
				a.rotate( this.angle );
				a.arc( this.origin.x, this.origin.y, this._r, this.ang.ai, this.ang.af );				

				a.restore();

			}

			if ( this.isFill ){a.fill();}
			if ( this.isStroke ){a.stroke();}

		}

		if ( this.render ){ ObjectRenderer.push( this ); }

	}


	function Background( x=0, y=0, w=1, h=1, render=true ){

		this.type = 'Background';

		this.position = new Vector2( x, y );

		this.origin = new Vector2( 0, 0 );
		this.rotating = false;

		this.render = render;

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

	function Square( x=0, y=0, w=1, h=1, render=true, style={} ){

		this.type = 'Square';

		this.position = new Vector2( x, y );

		this.origin = new Vector2( 0, 0 );
		this.rotating = false;

		this.render = render;

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

		for ( var i = 0; i < Object.keys(style).length; i++ ){
			let key = Object.keys(style)[i];
			let val = Object.values(style)[i];

			if ( typeof val == "object" ){
				for ( var ii = 0; ii < Object.keys(val).length; ii++ ){
					let key2 = Object.keys(val)[ii];
					let val2 = Object.values(val)[ii];

					this[ key ][ key2 ] = val2;
				}
			}else{
				this[ key ] = val;
			}

		}

		this.strokeIt = function (){
			this.isStroke = true;
		}
		this.fillIt = function (){
			this.isFill = true;
		}
		this.strokeOnly = function (){
			this.isFill = false;
			this.isStroke = true;
		}
		this.fillOnly = function (){
			this.isFill = true;
			this.isStroke = false;
		}

		this.Vertex = new Array(4);
		this.Vertex[0] = new Vector2( this.position.x - this._w/2, this.position.y - this._h/2 );
		this.Vertex[1] = new Vector2( this.position.x + this._w/2, this.position.y - this._h/2 );
		this.Vertex[2] = new Vector2( this.position.x - this._w/2, this.position.y + this._h/2 );
		this.Vertex[3] = new Vector2( this.position.x + this._w/2, this.position.y + this._h/2 );

		this.canvasRendering = ActiveCanvas[0].CTX;
		this.angle = DegToRad(0);

		this.name = {};
		this.nameSet = function ( x, align='center', edit={} ){

			this.name.text = x;
			this.name.align = align;
			this.name.render = new Text(this.name.text, "bold 15px Arial", this.position.x, this.position.y, true, this.name.align);

			let len = Object.keys(edit).length;
			for ( var i = 0; i < len; i++ ){
				let k = Object.keys(edit)[i];
				let v = Object.values(edit)[i];

				if ( typeof v == "object" ){
					for ( var ii = 0; ii < Object.keys(v).length; ii++ ){
						let k2 = Object.keys(v)[ii];
						let v2 = Object.values(v)[ii];

						if ( k2 == "x" || k2 == "y" ){
							if ( typeof edit[ k ][ k2 ] == "string" ){
								let sub = v2;
								let operation = sub[0];
								let construct = parseInt(sub.slice( sub.indexOf("|")+1, sub.length ) );

								this.name.render[ k ][ k2 ] = TurnToOperator( operation, [ this.name.render[ k ][ k2 ], construct ] );
							}else{
								this.name.render[ k ][ k2 ] = v2;
							}	
						}else{

							this.name.render[ k ][ k2 ] = v2;

						}

					}
				}else{
					if ( k == "_w" || k == "_h"){
						if ( typeof edit[ k ] == "string" ){
							let sub = edit[v];
							let operation = sub[0];
							let construct = parseInt(sub.slice( sub.indexOf("|")+1, sub.length ) );

							this.name.render[ k ] = TurnToOperator( operation, [ this.name.render[ k ], construct ] );

						}	
					}
					this.name.render[ k ] = v;

				}

			}

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
			this.render = false;
		}

		this.Render = function(){

			this.render = true;
			let renderNow = true;
			for ( var a = 0; a < ObjectRenderer.length; a++ ){
				if ( ObjectRenderer[a] == this ){
					renderNow = false;
				}
			}
			if ( renderNow ){
				ObjectRenderer.push(this);
			}
			
		}

		this.StatusRender = function ( a ){

			this.canvasRendering = a;

			//this.name.render.text = this.name.text;

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
				if ( arr[a] <= minimumValue ){

					minimumValue = arr[a];

				}

			}

		}else{

			for ( var a = 1; a < arr.length; a+=2 ){

				if ( a == 1 ){
					minimumValue = arr[a];
				}
				if ( arr[a] <= minimumValue ){

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

	function Array2dTo1d( arr2d ){

		var arr = [];
		for ( var a = 0; a < arr2d.length; a++ ){
			for ( var b = 0; b < arr2d[a].length; b++ ){
				arr.push(arr2d[a][b]);
			}
		}
		/*var o = 0;
		arr2d.forEach( function (e, i){
			e.forEach(function (e1, i1){
				arr[o] = e1;
				o++;
			});
		});*/

		return arr;

	}


	function Line ( coords, render=true ) {

		this.type = 'Line';

		this.position = {
			Coords: [],
			DeltaVertex: [],
			V: []
		};

		this.coords = coords;

		for ( var a = 0; a < coords.length; a+=2 ){

			this.position.Coords.push( [coords[a], coords[a+1] ] );

			let index = this.position.Coords.length-1;
			this.position.V[index] = {x: this.position.Coords[index][0], y: this.position.Coords[index][1] };

		}

		this.render = render;

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

		this.strokeIt = function (){
			this.isStroke = true;
		}
		this.fillIt = function (){
			this.isFill = true;
		}
		this.strokeOnly = function (){
			this.isFill = false;
			this.isStroke = true;
		}
		this.fillOnly = function (){
			this.isFill = true;
			this.isStroke = false;
		}

		this.name;
		this.nameSet = function ( x ){

			this.name = x;

		}
		this.showVertex = false;
		this.placedVertex = true;
		this.newVertex = [];
		this.Vertex = function (){
			this.showVertex = true;
		}

		this.addVertex = function ( x, y ){

			this.position.Coords.push( [ x, y ] );

		}

		this.MiddlePoint = function( arr ){

			var x = 'x';var y = 'y';
			var max = [ getHighValue( arr, x ), getHighValue( arr, y ) ]
			var min = [ getLowValue( arr, x ), getLowValue( arr, y ) ]

			this.x = ( max[0] - min[0] ) / 2;
			this.y = ( max[1] - min[1] ) / 2;
			this.min = min;
			this.max = max;

		}

		this.updateVertex = function (){
			var ps = new this.MiddlePoint( this.coords );
			this.position.x = ps.min[0] + ps.x;
			this.position.y = ps.min[1] + ps.y;
			this.size = {
				_w: Math.abs( ps.max[0] - ps.min[0] ),
				_h: Math.abs( ps.max[1] - ps.min[1] )
			}	
		}
		this.updateVertex();	

		this.DistVtx = function(){
			for ( var a = 0; a < this.position.Coords.length; a++ ){
				this.position.DeltaVertex.push( [ this.position.x - this.position.Coords[a][0], this.position.y - this.position.Coords[a][1] ] );
			}
		}
		this.DistVtx();

		this.updatePosition = function (){
			window.requestAnimationFrame( () => this.updatePosition() );

			for ( var t = 0; t < this.position.V.length; t++ ){
				this.position.Coords[t] = [ this.position.V[t].x, this.position.V[t].y ];
			}
			for ( var a = 0; a < this.position.Coords.length; a++ ){
				this.position.Coords[a] = [ this.position.x - this.position.DeltaVertex[a][0], this.position.y - this.position.DeltaVertex[a][1] ];
			}

			//update the length of coords vertex;
			this.coords = Array2dTo1d(this.position.Coords);
			this.updateVertex();

		}
		this.updatePosition();

		this.position.set = function (x, y){
			for ( var a = 0; a < this.position.Coords.length; a++ ){
				this.position.Coords[a] = [ x - this.DeltaVertex[a][0], y - this.DeltaVertex[a][1] ];
			}
			this.x = x;
			this.y = y;
		}

		this.remove = function(){
			
			for ( var a = 0; a < ObjectRenderer.length; a++ ){

				if ( ObjectRenderer[a] == this ){

					ObjectRenderer.splice( a, 1 );

				}

			}
			this.render = false;
		}

		this.Render = function(){

			this.render = true;
			let renderNow = true;
			for ( var a = 0; a < ObjectRenderer.length; a++ ){
				if ( ObjectRenderer[a] == this ){
					renderNow = false;
				}
			}
			if ( renderNow ){
				ObjectRenderer.push(this);
			}
			
		}

		this.StatusRender = function ( a ){

			this.updateVertex();

			if ( this.line ){
				a.lineWidth = this.line.width;
				a.lineCap = this.line.type;
			}

			for ( var z = 0; z < this.position.Coords.length; z++ ){

				if ( z == 0 ){ 

					if ( this.position.Coords[0][0].type == "Bezier" ){

						this.position.Coords[0][0].StatusRender( a );

					}else{

						a.moveTo( this.position.Coords[0][0], this.position.Coords[0][1]); 

					}


				}
				else { 

					if ( this.position.Coords[z][0].type == "Bezier" ){

						this.position.Coords[z][0].StatusRender( a );

					}else{

						a.lineTo( this.position.Coords[z][0], this.position.Coords[z][1] ); 

					}

				}

			}

			if ( this.close ){
				a.lineTo( this.position.Coords[0][0], this.position.Coords[0][1] );	
			}
			
			if ( this.showVertex && this.placedVertex ){
				for ( var i = 0; i < this.position.Coords.length; i++ ){
					this.newVertex.push(new Ball( this.position.Coords[i][0], this.position.Coords[i][1], 4 ));
					this.newVertex[i].color.fill = this.color.stroke;
				}
				this.placedVertex = false;
			}else if ( this.showVertex && !this.placedVertex ){

				for ( var i = 0; i < this.newVertex.length; i++ ){
					this.newVertex[i].position.set(this.position.Coords[i][0], this.position.Coords[i][1] );
					this.newVertex[i].color.fill = this.color.stroke;
				}

			}


			if ( this.isFill ) { a.fill(); }
			if ( this.isStroke ) { a.stroke(); }


		}

		if ( this.render ){ ObjectRenderer.push( this ); }

	}

	function Bezier( coords, render=true ){

		this.type = 'Bezier';

		this.position.Coords = [];

		for ( var a = 0; a < coords.length; a+=2 ){

			this.position.Coords.push( [ coords[a], coords[a+1] ] );

		}

		this.render = render;

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

		this.strokeIt = function (){
			this.isStroke = true;
		}
		this.fillIt = function (){
			this.isFill = true;
		}
		this.strokeOnly = function (){
			this.isFill = false;
			this.isStroke = true;
		}
		this.fillOnly = function (){
			this.isFill = true;
			this.isStroke = false;
		}

		this.remove = function(){
			
			for ( var a = 0; a < ObjectRenderer.length; a++ ){

				if ( ObjectRenderer[a] == this ){

					ObjectRenderer.splice( a, 1 );

				}

			}
			this.render = false;
		}

		this.Render = function(){

			this.render = true;
			let renderNow = true;
			for ( var a = 0; a < ObjectRenderer.length; a++ ){
				if ( ObjectRenderer[a] == this ){
					renderNow = false;
				}
			}
			if ( renderNow ){
				ObjectRenderer.push(this);
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
					console.table( this.position.Coords );

				}
				
			}
			window.onkeyup = e=>{
				window.Keys[e.keyCode] = false;
			}

			if ( window.Keys[ 37 ] ){	
				this.position.Coords[window.Selection][0] -= 1;
			}if ( window.Keys[ 38 ] ){	
				this.position.Coords[window.Selection][1] -= 1;
			}if ( window.Keys[ 39 ] ){	
				this.position.Coords[window.Selection][0] += 1;
			}if ( window.Keys[ 40 ] ){	
				this.position.Coords[window.Selection][1] += 1;
			}



			var pointH = new Array(this.position.Coords.length);
			var order = [ '#f00', '#0f0', '#00f', "#888" ];

			if ( !this.PointHelpers ){

				for ( var a = 0; a < pointH.length; a++ ){

					pointH[a] = new Ball( this.position.Coords[a][0], this.position.Coords[a][1], 3 );
					pointH[a].color.fill = order[a];
					pointH[a].color.isFill = true;

				}

				this.PointHelpers = pointH;

			}
			else{

				for ( var a = 0; a < this.PointHelpers.length; a++ ){

					this.PointHelpers[a].position.x = this.position.Coords[a][0];
					this.PointHelpers[a].position.y = this.position.Coords[a][1];

				}

			}
			

		}

		this.StatusRender = function ( a ){

			if ( this.line ){
				a.lineWidth = this.line.width;
				a.lineCap = this.line.type;
			}

			for ( var b = 0; b < this.position.Coords.length; b+=4 ){

				if ( b == 0 ) { 
					a.moveTo( this.position.Coords[b][0], this.position.Coords[b][1] ); 
					a.bezierCurveTo( 

					this.position.Coords[b+1][0], this.position.Coords[b+1][1],

					this.position.Coords[b+2][0], this.position.Coords[b+2][1],

					this.position.Coords[b+3][0], this.position.Coords[b+3][1],

				); }

			}


			if ( this.isFill ) { a.fill(); }
			if ( this.isStroke ) { a.stroke(); }

		}

		if ( this.render ){ ObjectRenderer.push( this ); }


	}

	function Vanish(){

		return new Object();

	}

	function Text( text, font="30px Arial", x=0, y=0, render=true, align="start" ){

		if ( text == null || text == undefined ) { text = new String(); }
		if ( font == 0 || font == null ){ font = '30px Arial'; }

		this.type = 'Text';

		this.text = text;

		this.font = font;

		this.align = align;

		this.position = new Vector2( x, y );

		this.render = render;

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

		this.strokeIt = function (){
			this.isStroke = true;
		}
		this.fillIt = function (){
			this.isFill = true;
		}
		this.strokeOnly = function (){
			this.isFill = false;
			this.isStroke = true;
		}
		this.fillOnly = function (){
			this.isFill = true;
			this.isStroke = false;
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
			this.render = false;

		}

		this.Render = function(){

			this.render = true;
			let renderNow = true;
			for ( var a = 0; a < ObjectRenderer.length; a++ ){
				if ( ObjectRenderer[a] == this ){
					renderNow = false;
				}
			}
			if ( renderNow ){
				ObjectRenderer.push(this);
			}
			
		}

		this.StatusRender = function ( a ){

			if ( this.line ){
				a.lineWidth = this.line.width;
				a.lineCap = this.line.type;
			}

			a.font = this.font;

			a.textAlign = this.align;

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
			this.render = false;
		}

		this.Render = function(){

			this.render = true;
			let renderNow = true;
			for ( var a = 0; a < ObjectRenderer.length; a++ ){
				if ( ObjectRenderer[a] == this ){
					renderNow = false;
				}
			}
			if ( renderNow ){
				ObjectRenderer.push(this);
			}
			
		}

		this.StatusRender = function ( a ){

			this.ImageProperties.x = this.position.x;
			this.ImageProperties.y = this.position.y;

			let w = this.img.width;
			let h = this.img.height;

			if ( this.ImageProperties.Rw  || this.ImageProperties.Cx ){
				if ( this.ImageProperties.Cx ){

					a.drawImage( this.img, this.ImageProperties.Cx, this.ImageProperties.Cy, this.ImageProperties.Cw, this.ImageProperties.Ch, this.ImageProperties.x, this.ImageProperties.y, this.ImageProperties.Rw, this.ImageProperties.Rh );

				}else{

					w = this.ImageProperties.Rw;
					h = this.ImageProperties.Rh;
					a.drawImage( this.img, this.ImageProperties.x-(w/2), this.ImageProperties.y-(h/2), this.ImageProperties.Rw, this.ImageProperties.Rh );
				}
			}else {

				a.drawImage( this.img, this.ImageProperties.x-(w/2), this.ImageProperties.y-(h/2) );	

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
	exports.Vanish = Vanish;
	exports.Vector2 = Vector2;
	exports.getHighValue = getHighValue;
	exports.getLowValue = getLowValue;
	exports.Background = Background;
	exports.Array2dTo1d = Array2dTo1d;
	exports.RenderThis = RenderThis;
	exports.InjectPositionRender = InjectPositionRender;
	exports.DEFAULT_COLOR = DEFAULT_COLOR;
	
	

}))
