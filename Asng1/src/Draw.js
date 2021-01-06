// Draw.js

// Vertex Shader Program
var VSHADER_SOURCE = 
	"attribute vec4 a_Position;\n" +
	"void main(){\n" +
	"	gl_Position = a_Position;\n" +
	"}\n";

// Fragment Shader Program
var FSHADER_SOURCE = 
	"precision mediump float;\n" +
	"uniform vec4 u_FragColor;\n" +
	"void main(){\n" +
	"	gl_FragColor = u_FragColor;\n" +
	//"	gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n" +
	"}\n";

//----------------------------------------------------------------
// Global Variables
var BRUSH = "triangle";
var vBuffer = [];
var cBuffer = [];
var n = 0;
var mouseValue = false;
var rainbowB = false;
var rainbowC = 0;

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

	// Set Initial Canvas Status
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Set Button Actions
	const clearC = document.getElementById("clear");
	clearC.addEventListener('click', function() {clearCanvas(gl)});
	const brushT = document.getElementById("triangle");
	brushT.addEventListener('click', function() {changeBrush("t")});
	const brushC = document.getElementById("circle");
	brushC.addEventListener('click', function() {changeBrush("c")});

	const setRB = document.getElementById("rainbow");
	setRB.addEventListener('click', function() {
		if (setRB.value == "Rainbow: Off"){
			rainbowB = true;
			setRB.value = "Rainbow: On"
		}
		else{
			rainbowB = false;
			setRB.value = "Rainbow: Off";
		}

	});

	// Draw Function
	
	canvas.onmouseup = function(ev) {  mouseValue = false; };
	canvas.onmousedown = function(ev) { mouseValue = true; click(ev, gl, canvas);} 
	canvas.onmousemove = function(ev) { if (mouseValue == true) click(ev, gl, canvas); };
}
//-------------------------------------------------------------------

function clearCanvas(gl){
	gl.clear(gl.COLOR_BUFFER_BIT);
	vBuffer = [];
	cBuffer = [];
	n = 0;
}
function changeBrush(char){
	if (char == "t") BRUSH = "triangle";
	if (char == "c") BRUSH = "circle";
}

function click(ev, gl, canvas){
	// Get new center
	var x = ev.clientX;
	var y = ev.clientY; 
	var rect = ev.target.getBoundingClientRect();
	x = ((x - rect.left) - canvas.height/2)/(canvas.height/2); 
	y = (canvas.width/2 - (y - rect.top))/(canvas.width/2);



	// Add brushstroke to buffer
	if (BRUSH == "triangle") drawTriangle(x, y);
	if (BRUSH == "circle") drawCircle(x, y);

	redraw(gl);
}

function addColor(){
	if (!rainbowB){
		r = document.getElementById("red");
		b = document.getElementById("blue");
		g = document.getElementById("green");
		cBuffer.push(r.value);
		cBuffer.push(g.value);
		cBuffer.push(b.value);
	}
	else{
		var rgb = [0.0, 0.0, 0.0];
		if (rainbowC == 0) rgb = [1.0, 0.0, 0.0];
		else if (rainbowC == 1) rgb = [0.8, 0.2, 0.0];
		else if (rainbowC == 2) rgb = [0.6, 0.4, 0.0];
		else if (rainbowC == 3) rgb = [0.4, 0.6, 0.0];
		else if (rainbowC == 4) rgb = [0.2, 0.8, 0.0];
		else if (rainbowC == 5) rgb = [0.0, 1.0, 0.0];
		else if (rainbowC == 6) rgb = [0.0, 0.8, 0.2];
		else if (rainbowC == 7) rgb = [0.0, 0.6, 0.4];
		else if (rainbowC == 8) rgb = [0.0, 0.4, 0.6];
		else if (rainbowC == 9) rgb = [0.0, 0.2, 0.8];
		else if (rainbowC == 10) rgb = [0.0, 0.0, 1.0];
		else if (rainbowC == 11) rgb = [0.2, 0.0, 0.8];
		else if (rainbowC == 12) rgb = [0.4, 0.0, 0.6];
		else if (rainbowC == 13) rgb = [0.6, 0.0, 0.4];
		else if (rainbowC == 14) {rgb = [0.8, 0.0, 0.2];
									rainbowC = 0;}
		++rainbowC;

		cBuffer.push(rgb[0]);
		cBuffer.push(rgb[1]);
		cBuffer.push(rgb[2]);
	}

	a = document.getElementById("alpha");
	cBuffer.push(a.value);
}

function drawTriangle(x, y){
	var s = document.getElementById("size");
	var ss = s.value;
	vBuffer.push(x);
	vBuffer.push(y+(ss/2));

	vBuffer.push(x+(ss/2));
	vBuffer.push(y-(ss/2));

	vBuffer.push(x-(ss/2));
	vBuffer.push(y-(ss/2));

	addColor();
	n = n + 3;
}

function drawCircle(x, y){
	var s = document.getElementById("size");
	var ss = s.value;
	var c = document.getElementById("seg");
	var cPoly = c.value;
	var step = (Math.PI*2)/cPoly;
	for (var i = 0; i < cPoly; ++i){
		vBuffer.push(x);
		vBuffer.push(y);

		vBuffer.push(x + ss*Math.cos(i*step)/2);
		vBuffer.push(y + ss*Math.sin(i*step)/2);

		vBuffer.push(x + ss*Math.cos((i+1)*step)/2);
		vBuffer.push(y + ss*Math.sin((i+1)*step)/2);

		addColor();
	}
	n = n + cPoly*3;
}

function redraw(gl){
	/*
	// Create Float32 Buffer
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

	var a_Position= gl.getAttribLocation(gl.program, 'a_Position');
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);

	// Draw new canvas
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, n);
	*/

	var a_Position= gl.getAttribLocation(gl.program, 'a_Position');

	gl.clear(gl.COLOR_BUFFER_BIT);
	for (var i = 0; i<n*2; i+=6){
		var verts = new Float32Array(6);
		for (var j = 0; j < 6; ++j){
			verts[j] = vBuffer[i + j];
		}

		var vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(a_Position);

		var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
		gl.uniform4f(u_FragColor, cBuffer[4*i/6],cBuffer[1 + 4*i/6],cBuffer[2 + 4*i/6],cBuffer[3 + 4*i/6]);

		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}
}