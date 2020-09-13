function DOM(){
	this.create = function (x){
		return document.createElement(x);
	}
	this.$id = function (x){
		return document.getElementById(x);
	}
	this.$class = function (x){
		return document.getElementsByClassName(x);
	}
	this.$tag = function (x){
		return document.querySelector(x);
	}
	this.$allTags = function (x){
		return document.querySelectorAll(x);
	}
	this.attach = function (x,y){
		x.append(y);
	}
	this.$style = function (x,y){
		var a = getComputedStyle(x)[y];
		var b = a.indexOf('px') != -1? parseInt(a.slice(0, a.indexOf('px'))) : a;
		if (a == b){
			return a;
		}else{
			return [a, b];
		}
	}
	this.$$style = function (x,y,z=0){
		if (typeof y == 'object'){
			var keys = Object.keys(y);
			var values = Object.values(y);
			for (var b = 0; b < keys.length; b++){
				x.style[keys[b]] = values[b];
			}
		}else{
			x.style[y] = z;
		}
	}
	this.sSize = function (){
		return [window.innerWidth, window.innerHeight];
	}
	this.$$px = function(x){
		return x+'px';
	}
}
const W = 'width';
const H = 'height';