// 3dOp.js

// Vertex Shader Program
var VSHADER_SOURCE = 
	"attribute vec4 a_Position;\n" +
	'uniform mat4 globR;\n' +
	'uniform mat4 animate;\n' +
	"void main(){\n" +
	"	gl_Position = globR * animate * a_Position;\n" +
	"}\n";

// Fragment Shader Program
var FSHADER_SOURCE = 
	"precision mediump float;\n" +
	"uniform vec4 u_FragColor;\n" +
	"void main(){\n" +
	"	gl_FragColor = u_FragColor;\n" +
	"}\n";

//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
// Global Variables
var vBuffer = [];
var cBuffer = [];
var mBuffer = [];
var n = 0;

var gR = document.getElementById("rotation");
var u_Matrix;
var globalRotate = new Matrix4();
var u_Mat_A;

function main() {
	// Prepare Canvas
	var canvas = document.getElementById("canvas");
	var gl = getWebGLContext(canvas);
	if (!gl){
		console.log("Failed to get rendering context for WebGl");
		return
	}

	// Init Shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to initialize shaders.'); 
		return;
	}

	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	u_Matrix = gl.getUniformLocation(gl.program, 'globR');
	u_Mat_A = gl.getUniformLocation(gl.program, 'animate');

	//gR.addEventListener("change", function(){renderScene(gl);})

	initDraw(gl);
	var pp = document.getElementById("ani");
	pp.addEventListener("click", function(){
		if (pp.value == "Play") pp.value = "Pause";
		else if (pp.value == "Pause") pp.value = "Play";
	})


	var tick = function(){
		if (pp.value == "Pause") {animate();}
		renderScene(gl);
		requestAnimationFrame(tick);
	}

	tick();
}
//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
function initDraw(gl){
	var mat = new Matrix4();
	mat.setScale(.125, .1, .1);
	mat.rotate(5, 0, 0, 1);
	mat.translate(-5, 3.5, 0);
	drawCube(mat, [0.8, 0.5, 0.4, 1.0]); // Mouth n==0
	
	mat.setScale(.06, .04, .07);
	mat.translate(-13, 9.5, 0);
	drawCube(mat, [0.25, 0.25, 0.25, 1.0]); // Nose n==1

	mat.setScale(.2, .2, .2);
	mat.translate(-2, 1.75, 0);
	drawCube(mat, [0.55, 0.45, 0.35, 1.0]); // Head n==2

	mat.setScale(.06, .12, .06);
	mat.rotate(25, 1, 0, 0);
	mat.translate(-5, 4.75, 0);
	drawCube(mat, [0.6, 0.5, 0.4, 1.0]); // L Ear n==3

	mat.setScale(.06, .12, .06);
	mat.rotate(-25, 1, 0, 0);
	mat.translate(-5, 4.75, 0);
	drawCube(mat, [0.6, 0.5, 0.4, 1.0]); // R Ear n==4

	mat.setScale(.175, .25, .25);
	mat.translate(-0.5, 0, 0);
	drawCube(mat, [0.35, 0.25, 0.15, 1.0]); // Upper Body n==5

	mat.setScale(.1, .13, .1);
	mat.translate(-1.61, -2.25, 1.49);
	drawCube(mat, [0.51, 0.41, 0.31, 1.0]); // Upper Right limb 1 n==6

	mat.setScale(.1, .1, .1);
	mat.translate(-1.61, -5.2, 1.49);
	drawCube(mat, [0.51, 0.41, 0.31, 1.0]); // Upper Right limb 2 n==7

	mat.setScale(.1, .13, .1);
	mat.translate(-1.61, -2.25, -1.49);
	drawCube(mat, [0.53, 0.43, 0.33, 1.0]); // Upper Left limb 1 n==8

	mat.setScale(.1, .1, .1);
	mat.translate(-1.61, -5.2, -1.49);
	drawCube(mat, [0.53, 0.43, 0.33, 1.0]); // Upper Left limb 2 n==9

	mat.setScale(.175, .25, .25);
	mat.translate(1.5, 0, 0);
	drawCube(mat, [0.35, 0.25, 0.15, 1.0]); // Lower Body n==10

	mat.setScale(.075, .075, .075);
	mat.translate(6.5, 3, 0);
	drawCube(mat, [0.25, 0.15, 0.05, 1.0]); // Tail n==11

	mat.setScale(.1, .13, .1);
	mat.translate(3.27, -2.25, 1.49); 
	drawCube(mat, [0.52, 0.42, 0.32, 1.0]); // Lower Right limb 1 n==12

	mat.setScale(.1, .1, .1);
	mat.translate(3.27, -5.2, 1.49);
	drawCube(mat, [0.52, 0.42, 0.32, 1.0]); // Lower Right limb 2 n==13

	mat.setScale(.1, .13, .1);
	mat.translate(3.27, -2.25, -1.49);
	drawCube(mat, [0.5, 0.4, 0.3, 1.0]); // Lower Left limb 1 n==14

	mat.setScale(.1, .1, .1);
	mat.translate(3.27, -5.2, -1.49);
	drawCube(mat, [0.5, 0.4, 0.3, 1.0]); // Lower Left limb 2 n==15

	mat.setScale(.1, .25, .25);
	mat.translate(.75, 0, 0);
	drawCube(mat, [0.35, 0.25, 0.15, 1.0]); // Mid Body






	// Add all verts to array
	var verts = new Float32Array(vBuffer.length);
	for (var i = 0; i < vBuffer.length; ++i){
		verts[i] = vBuffer[i];
	}
	var vertexBuffer = gl.createBuffer();
	if (!vertexBuffer) {
		console.log('Failed to create the buffer object '); 
		return -1;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);

	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);
}

function drawCube(m, c){
	var s = 1;
	var temp = [];

	temp.push(new Vector4([ s, s, s, 1]));
	temp.push(new Vector4([-s, s, s, 1]));
	temp.push(new Vector4([-s,-s, s, 1]));
		temp.push(new Vector4([-s,-s, s, 1]));
		temp.push(new Vector4([ s,-s, s, 1]));
		temp.push(new Vector4([ s, s, s, 1]));

	temp.push(new Vector4([ s, s,-s, 1]));
	temp.push(new Vector4([-s, s,-s, 1]));
	temp.push(new Vector4([-s,-s,-s, 1]));
		temp.push(new Vector4([-s,-s,-s, 1]));
		temp.push(new Vector4([ s,-s,-s, 1]));
		temp.push(new Vector4([ s, s,-s, 1]));

	temp.push(new Vector4([ s, s, s, 1]));
	temp.push(new Vector4([-s, s, s, 1]));
	temp.push(new Vector4([-s, s,-s, 1]));
		temp.push(new Vector4([-s, s,-s, 1]));
		temp.push(new Vector4([ s, s,-s, 1]));
		temp.push(new Vector4([ s, s, s, 1]));

	temp.push(new Vector4([ s,-s, s, 1]));
	temp.push(new Vector4([-s,-s, s, 1]));
	temp.push(new Vector4([-s,-s,-s, 1]));
		temp.push(new Vector4([-s,-s,-s, 1]));
		temp.push(new Vector4([ s,-s,-s, 1]));
		temp.push(new Vector4([ s,-s, s, 1]));

	temp.push(new Vector4([ s, s, s, 1]));
	temp.push(new Vector4([ s,-s, s, 1]));
	temp.push(new Vector4([ s,-s,-s, 1]));
		temp.push(new Vector4([ s,-s,-s, 1]));
		temp.push(new Vector4([ s, s,-s, 1]));
		temp.push(new Vector4([ s, s, s, 1]));

	temp.push(new Vector4([-s, s, s, 1]));
	temp.push(new Vector4([-s,-s, s, 1]));
	temp.push(new Vector4([-s,-s,-s, 1]));
		temp.push(new Vector4([-s,-s,-s, 1]));
		temp.push(new Vector4([-s, s,-s, 1]));
		temp.push(new Vector4([-s, s, s, 1]));
	
	for (var i = 0; i<temp.length; ++i){
		var mv = m.multiplyVector4(temp[i]);
		var v = mv.elements;
		vBuffer.push(v[0]);
		vBuffer.push(v[1]);
		vBuffer.push(v[2]);
		//vBuffer.push(v[3]);
		delete temp[i];
	}

	// Color
	cBuffer.push(c[0]);
	cBuffer.push(c[1]);
	cBuffer.push(c[2]);
	cBuffer.push(c[3]);

	// Init Cube Matrix transform
	mBuffer.push(new Matrix4());

	n += 1;
}

function renderScene(gl){
	// Clear
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Global view
	globalRotate.setRotate(gR.value, 0, 1, 0)

	for (var j = 0; j < n; ++j){
		// Set Color
		var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
		gl.uniform4f(u_FragColor, cBuffer[4*j],cBuffer[1 + 4*j],cBuffer[2 + 4*j],cBuffer[3 + 4*j]);

		gl.uniformMatrix4fv(u_Matrix, false, globalRotate.elements);
		gl.uniformMatrix4fv(u_Mat_A, false, mBuffer[j].elements);

		// Draw new canvas
		gl.drawArrays(gl.TRIANGLES, 36*j, 36);
	}
}

var g_last = Date.now();
var angle = 0;
var direction = true;
function animate(){
	// Calculate the elapsed time 
	var now = Date.now();
	var elapsed = now - g_last; // milliseconds 
	g_last = now;

	if (direction && angle >= 5) direction = false;
	else if (!direction && angle <= -10) direction = true;

	if (direction) angle = angle + (15 * elapsed) / 1000;
	else if (!direction) angle = angle - (15 * elapsed) / 1000;
	angle %= 360;

	// Upper Body
	for (var i=5; i <=9; ++i){
		mBuffer[i].setRotate(angle, 0, 0, 1);
	}

	// Lower Body
	for (var i=10; i <=15; ++i){
		mBuffer[i].setRotate(-angle, 0, 0, 1);
	}

	// Upper Leg
	for (var i=6; i<=9; ++i){
		mBuffer[i].rotate(angle/2, 0, 0, 1)
	}
	mBuffer[7].rotate(angle, 0, 0, 1);
	mBuffer[9].rotate(angle, 0, 0, 1);

	// Upper Leg
	for (var i=12; i<=15; ++i){
		mBuffer[i].rotate(-angle/2, 0, 0, 1)
	}
	mBuffer[13].rotate(-angle, 0, 0, 1);
	mBuffer[15].rotate(-angle, 0, 0, 1);


}