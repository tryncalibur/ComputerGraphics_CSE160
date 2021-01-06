// Vertex Shader Program
var VSHADER_SOURCE = 
	"attribute vec4 a_Position;\n" +
	'attribute vec2 a_TexCoord;\n' + 
	'varying vec2 v_TexCoord;\n' +
	'uniform mat4 u_ProjectionMatrix;\n' +
	'uniform mat4 u_ViewMatrix;\n' +

	"void main(){\n" +
	"	gl_Position = u_ProjectionMatrix * u_ViewMatrix * a_Position;\n" +
	' v_TexCoord = a_TexCoord;\n' +
	"}\n";

// Fragment Shader Program
var FSHADER_SOURCE = 
	"precision mediump float;\n" +
	'uniform sampler2D u_Sampler;\n' +
	'uniform sampler2D u_Sampler2;\n' +
	'uniform sampler2D u_Sampler3;\n' +
	"uniform vec4 texCol;" + 
	'varying vec2 v_TexCoord;\n' +
	"void main(){\n" +
	//"gl_FragColor = vec4(v_TexCoord.x, v_TexCoord.y, 0.0, 1.0);"+
	"	if (texCol.w == 0.0) {gl_FragColor = texture2D(u_Sampler, v_TexCoord);}\n" +
	"	else if (texCol.w == 0.1) {gl_FragColor = texture2D(u_Sampler2, v_TexCoord);}\n" +
	"	else if (texCol.w == 0.2) {gl_FragColor = texture2D(u_Sampler3, v_TexCoord);}\n" +
	'	else {gl_FragColor = texCol;}\n' +
	//"	else {gl_FragColor = vec4(v_TexCoord.x, v_TexCoord.y, 0.0, 1.0);}\n" +
	"}\n";

//----------------------------------------------------------------
//----------------------------------------------------------------
var gl;
var buffer = [];
var n = 0;
var m = 0;
var o = 0;

var u_Project;
var u_View;
var mat_P = new Matrix4();
var mat_V = new Matrix4();

var eyeX = 1;
var atX = 2;

var eyeY = 0.75;
var atY = 0.75;

var eyeZ = 1;
var atZ = 1;



function main(){
	// Prepare Canvas
	var canvas = document.getElementById("canvas");
	gl = getWebGLContext(canvas);
	if (!gl){
		console.log("Failed to get rendering context for WebGl");
		return
	}

	// Init Shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to initialize shaders.'); 
		return;
	}

	// Set Up camera vars
	u_Project = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
	u_View = gl.getUniformLocation(gl.program, "u_ViewMatrix");
	mat_P.setPerspective(60, 1, 0.001, 32*s*Math.sqrt(2))
	gl.uniformMatrix4fv(u_Project, false, mat_P.elements);

	// Set Inital Camera Angle
	theta = 3 * Math.PI/2;


	// Setting the textures 
	var t = initVertexBuffers();
	if (!initTextures()) {
		console.log("Failed to Load Image.")
		return;
	}

	// Set Initial Canvas Status
	gl.clearColor(0.0, 1.0, 1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	document.addEventListener('keydown', function(e){
		detectKey(e.which);
	});

	canvas.onmousemove = function(ev) { move(ev, canvas); }

	var tick = function(){
		drawScene();
		requestAnimationFrame(tick);
	}

	tick();
}

//----------------------------------------------------------------
//----------------------------------------------------------------
var speed = 0.3;
var theta = 0;
var theta2 = 3*Math.PI/2;
function detectKey(e){
	switch(e){
		case 87:{ //w
			var len = (atX-eyeX)*speed;
			eyeX += len;
			atX += len;
				len = (atZ-eyeZ)*speed;
			eyeZ += len;
			atZ += len
				len = (atY-eyeY)*speed;
			eyeY += len;
			atY += len;
			break;
		}	
		case 83:{ //s
			var len = (atX-eyeX)*speed;
			eyeX -= len;
			atX -= len;
				len = (atZ-eyeZ)*speed;
			eyeZ -= len;
			atZ -= len
				len = (atY-eyeY)*speed;
			eyeY -= len;
			atY -= len;
			break;
		}
		case 65:{ //a
			var len = -(atX-eyeX)*speed;
			var llen = (atZ-eyeZ)*speed;
			eyeX += llen;
			atX += llen;
			eyeZ += len;
			atZ += len
			break;
		}
		case 68:{ //d
			var len = (atX-eyeX)*speed;
			var llen = -(atZ-eyeZ)*speed;
			eyeX += llen;
			atX += llen;
			eyeZ += len;
			atZ += len
			break;
		}
		case 81:{ //q
			var rx = Math.abs(atX-eyeX);
			var rz = Math.abs(atZ-eyeZ);
			var r = Math.sqrt(Math.pow(rx, 2) + Math.pow(rz, 2));

			theta += speed/3;

			atX = eyeX - r * Math.sin(theta);
			atZ = eyeZ - r * Math.cos(theta);
			break;
		}
		case 69:{ //e
			var rx = Math.abs(atX-eyeX);
			var rz = Math.abs(atZ-eyeZ);
			var r = Math.sqrt(Math.pow(rx, 2) + Math.pow(rz, 2));

			theta -= speed/3;

			atX = eyeX - r * Math.sin(theta);
			atZ = eyeZ - r * Math.cos(theta);
			break;
		}
	}
}

var init = false;
var px = 0;
var py = 0;
function move(ev, canvas){
	var x = ev.clientX;
	var y = ev.clientY; 
	var rect = ev.target.getBoundingClientRect();
	x = ((x - rect.left) - canvas.height/2)/(canvas.height/2); 
	y = (canvas.width/2 - (y - rect.top))/(canvas.width/2);

	if (!init){
		px = x;
		py = y;
		init = true;
	}
	else{
		var rx = Math.abs(atX-eyeX);
		var rz = Math.abs(atZ-eyeZ);
		var r = Math.sqrt(Math.pow(rx, 2) + Math.pow(rz, 2));

		theta += (px-x);

		atX = eyeX - r * Math.sin(theta);
		atZ = eyeZ - r * Math.cos(theta);
		px = x;



		var ry = Math.abs(atY-eyeY);
		var r2 = Math.sqrt(Math.pow(rx, 2) + Math.pow(ry, 2));

		theta2 += (py-y);

		atX = eyeX - r2 * Math.sin(theta2);
		atY = eyeY - r2 * Math.cos(theta2);
		py = y;
	}
}

function initVertexBuffers(){
	// Draw Scene
	initScene();

	// Create Float32 buffer
	var fullBuffer = new Float32Array(buffer.length);
	for (var i = 0; i < buffer.length; ++i){
		fullBuffer[i] = buffer[i];
	}

	// Create and write buffer
	var vertexTexCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, fullBuffer, gl.STATIC_DRAW);

	var FSIZE = fullBuffer.BYTES_PER_ELEMENT;

	// Set Postion Buffer Data
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0); 
	gl.enableVertexAttribArray(a_Position); 

	// Allocate the texture coordinates to a_TexCoord, and enable it.
	var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord')
	gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3); 

	// Enable buffer allocation
	gl.enableVertexAttribArray(a_TexCoord); 
}

var textures = [];
function initTextures(){
	textures.length = 3;

	// Get Images
	var u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler');
	var image1 = new Image();
	image1.onload = function(){loadTexture(u_Sampler1, image1, 0);};
	image1.src = "src/wall1.jpg";

	var u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
	var image2 = new Image();
	image2.onload = function(){loadTexture(u_Sampler2, image2, 1);};
	image2.src = "src/wall2.jpg";

	var u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
	var image3 = new Image();
	image3.onload = function(){loadTexture(u_Sampler3, image3, 2);};
	image3.src = "src/wall3.jpg";

	// Set Texture array
	gl.uniform1i(u_Sampler1, 0);  // texture unit 0
  	gl.uniform1i(u_Sampler2, 1);  // texture unit 1
  	gl.uniform1i(u_Sampler3, 2);  // texture unit 2


	drawScene();
	return true;
}

function loadTexture(u_Sampler, im, x){
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Prepare Texture
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
	
	// Set Image
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);

	textures[x] = texture;
}

function drawScene(){
	// Clear
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Update camera
	mat_V.setLookAt(eyeX, eyeY, eyeZ, atX, atY, atZ, 0, 1, 0);
	gl.uniformMatrix4fv(u_View, false, mat_V.elements);

	// Draw Wall Textures
	gl.activeTexture(gl.TEXTURE0);
  	gl.bindTexture(gl.TEXTURE_2D, textures[0]);
  	gl.activeTexture(gl.TEXTURE1);
  	gl.bindTexture(gl.TEXTURE_2D, textures[1]);
  	gl.activeTexture(gl.TEXTURE2);
  	gl.bindTexture(gl.TEXTURE_2D, textures[2]);

	var tc = gl.getUniformLocation(gl.program, 'texCol');
	gl.uniform4f(tc, 0.0, 0.0, 0.0, 0.0);
	gl.drawArrays(gl.TRIANGLES, 0, n);

	gl.uniform4f(tc, 0.0, 0.0, 0.0, 0.1);
	gl.drawArrays(gl.TRIANGLES, n, m);

	gl.uniform4f(tc, 0.0, 0.0, 0.0, 0.2);
	gl.drawArrays(gl.TRIANGLES, n + m, o);

	gl.uniform4f(tc, 0.5, 0.3, 0.4, 1.0);
	gl.drawArrays(gl.TRIANGLES, n + m + o, 6);
}

var s = .5;
function drawCube(m, tex){
	var temp = [];
	var ttemp = [];

	temp.push(new Vector4([ s, s, s, 1]));
	ttemp.push(1); ttemp.push(1);
	temp.push(new Vector4([0, s, s, 1]));
	ttemp.push(0); ttemp.push(1);
	temp.push(new Vector4([0, 0, s, 1]));
	ttemp.push(0); ttemp.push(0);
		temp.push(new Vector4([ 0, 0, s, 1]));
		ttemp.push(0); ttemp.push(0);
		temp.push(new Vector4([ s, 0, s, 1]));
		ttemp.push(1); ttemp.push(0);
		temp.push(new Vector4([ s, s, s, 1]));
		ttemp.push(1); ttemp.push(1);

	temp.push(new Vector4([ s, s, 0, 1]));
	ttemp.push(1); ttemp.push(1);
	temp.push(new Vector4([ 0, s, 0, 1]));
	ttemp.push(0); ttemp.push(1);
	temp.push(new Vector4([ 0, 0, 0, 1]));
	ttemp.push(0); ttemp.push(0);
		temp.push(new Vector4([ 0, 0, 0, 1]));
		ttemp.push(0); ttemp.push(0);
		temp.push(new Vector4([ s, 0, 0, 1]));
		ttemp.push(1); ttemp.push(0);
		temp.push(new Vector4([ s, s, 0, 1]));
		ttemp.push(1); ttemp.push(1);

	temp.push(new Vector4([ s, s, s, 1]));
	ttemp.push(1); ttemp.push(1);
	temp.push(new Vector4([ 0, s, s, 1]));
	ttemp.push(0); ttemp.push(1);
	temp.push(new Vector4([ 0, s, 0, 1]));
	ttemp.push(0); ttemp.push(0);
		temp.push(new Vector4([ 0, s, 0, 1]));
		ttemp.push(0); ttemp.push(0);
		temp.push(new Vector4([ s, s, 0, 1]));
		ttemp.push(1); ttemp.push(0);
		temp.push(new Vector4([ s, s, s, 1]));
		ttemp.push(1); ttemp.push(1);

	temp.push(new Vector4([ s, 0, s, 1]));
	ttemp.push(1); ttemp.push(1);
	temp.push(new Vector4([ 0, 0, s, 1]));
	ttemp.push(0); ttemp.push(1);
	temp.push(new Vector4([ 0, 0, 0, 1]));
	ttemp.push(0); ttemp.push(0);
		temp.push(new Vector4([ 0, 0, 0, 1]));
		ttemp.push(0); ttemp.push(0);
		temp.push(new Vector4([ s, 0, 0, 1]));
		ttemp.push(1); ttemp.push(0);
		temp.push(new Vector4([ s, 0, s, 1]));
		ttemp.push(1); ttemp.push(1);

	temp.push(new Vector4([ s, s, s, 1]));
	ttemp.push(1); ttemp.push(1);
	temp.push(new Vector4([ s, 0, s, 1]));
	ttemp.push(0); ttemp.push(1);
	temp.push(new Vector4([ s, 0, 0, 1]));
	ttemp.push(0); ttemp.push(0);
		temp.push(new Vector4([ s, 0, 0, 1]));
		ttemp.push(0); ttemp.push(0);
		temp.push(new Vector4([ s, s, 0, 1]));
		ttemp.push(1); ttemp.push(0);
		temp.push(new Vector4([ s, s, s, 1]));
		ttemp.push(1); ttemp.push(1);

	temp.push(new Vector4([ 0, s, s, 1]));
	ttemp.push(1); ttemp.push(1);
	temp.push(new Vector4([ 0, 0, s, 1]));
	ttemp.push(0); ttemp.push(1);
	temp.push(new Vector4([ 0, 0, 0, 1]));
	ttemp.push(0); ttemp.push(0);
		temp.push(new Vector4([ 0, 0, 0, 1]));
		ttemp.push(0); ttemp.push(0);
		temp.push(new Vector4([ 0, s, 0, 1]));
		ttemp.push(1); ttemp.push(0);
		temp.push(new Vector4([ 0, s, s, 1]));
		ttemp.push(1); ttemp.push(1);


	for (var i = 0; i<temp.length; ++i){			//Buffer = [v1, v2, v3, t1, t2]
		var mv = m.multiplyVector4(temp[i]);
		var v = mv.elements;
		var tp = i*2
		buffer.push(v[0]);
		buffer.push(v[1]);
		buffer.push(v[2]);
		buffer.push(ttemp[tp]);
		buffer.push(ttemp[tp + 1]);
		delete temp[i];
	}
	return 36;
}

function initScene(){
	var mat = new Matrix4();

	mat.setTranslate(2*s, 0, 6*s);
	n += drawCube(mat);
	mat.setTranslate(3*s, 0, 5*s);
	n +=drawCube(mat);
	mat.setTranslate(4*s, 0, 6*s);
	n +=drawCube(mat);
	mat.setTranslate(3*s, 0, 7*s);
	n +=drawCube(mat);

	mat.setTranslate(10*s, 0, 6*s);
	n += drawCube(mat);
	mat.setTranslate(7*s, 0, 5*s);
	n +=drawCube(mat);
	mat.setTranslate(9*s, 0, 6*s);
	n +=drawCube(mat);
	mat.setTranslate(8*s, 0, 7*s);
	n +=drawCube(mat);

	mat.setTranslate(2*s, 0, 10*s);
	n += drawCube(mat);
	mat.setTranslate(2*s, s, 10*s);
	n += drawCube(mat);
	mat.setTranslate(2*s, 2*s, 10*s);
	n += drawCube(mat);
	mat.setTranslate(3*s, 0, 11*s);
	n +=drawCube(mat);
	mat.setTranslate(3*s, 2*s, 11*s);
	n +=drawCube(mat);
	mat.setTranslate(4*s, 0, 12*s);
	n +=drawCube(mat);
	mat.setTranslate(4*s, 2*s, 12*s);
	n +=drawCube(mat);
	mat.setTranslate(3*s, 3*s, 12*s);
	n +=drawCube(mat);
	mat.setTranslate(3*s, 0, 13*s);
	n +=drawCube(mat);
	mat.setTranslate(3*s, 2*s, 13*s);
	n +=drawCube(mat);
	mat.setTranslate(2*s, 0, 14*s);
	n +=drawCube(mat);
	mat.setTranslate(2*s, 1*s, 14*s);
	n +=drawCube(mat);
	mat.setTranslate(2*s, 2*s, 14*s);
	n +=drawCube(mat);

	mat.setTranslate(15*s, 0, 15*s);
	n +=drawCube(mat);
	mat.setTranslate(16*s, 0, 15*s);
	n +=drawCube(mat);
	mat.setTranslate(15*s, 0, 16*s);
	n +=drawCube(mat);
	mat.setTranslate(16*s, 0, 16*s);
	n +=drawCube(mat);
	mat.setTranslate(17*s, 0, 17*s);
	n +=drawCube(mat);
	mat.setTranslate(18*s, 0, 17*s);
	n +=drawCube(mat);
	mat.setTranslate(15.5*s, s, 15.5*s);
	n +=drawCube(mat);
	mat.setTranslate(16.5*s, s, 16.5*s);
	n +=drawCube(mat);
	mat.setTranslate(17*s, s, 16.5*s);
	n +=drawCube(mat);

	for (var i = 1; i < 13; ++i){
		mat.setTranslate(s*i, 0, s*3);
		n +=drawCube(mat);
		if (i%2 == 0){
			mat.setTranslate(s*i, s*2, s*3);
			n +=drawCube(mat);
			mat.setTranslate(s*i, s, s*3);
			n +=drawCube(mat);
		}
		if (i%2 == 1){
			mat.setTranslate(s*i, s*3, s*3);
			n +=drawCube(mat);
		}
	}
	mat.setTranslate(13*s, 0, s*3);
	n +=drawCube(mat);
	mat.setTranslate(13*s, s, s*3);
	n +=drawCube(mat);
	mat.setTranslate(14*s, 0, s*3);
	n +=drawCube(mat);

	
	mat.setTranslate(18*s, 0, 18*s);
	n +=drawCube(mat);
	mat.setTranslate(19*s, 0, 18*s);
	n +=drawCube(mat);
	mat.setTranslate(18*s, 0, 19*s);
	n +=drawCube(mat);
	mat.setTranslate(26*s, 0, 18*s);
	n +=drawCube(mat);
	mat.setTranslate(25*s, 0, 18*s);
	n +=drawCube(mat);
	mat.setTranslate(26*s, 0, 19*s);
	n +=drawCube(mat);
	mat.setTranslate(18*s, 0, 26*s);
	n +=drawCube(mat);
	mat.setTranslate(19*s, 0, 26*s);
	n +=drawCube(mat);
	mat.setTranslate(18*s, 0, 25*s);
	n +=drawCube(mat);
	mat.setTranslate(26*s, 0, 26*s);
	n +=drawCube(mat);
	mat.setTranslate(25*s, 0, 26*s);
	n +=drawCube(mat);
	mat.setTranslate(26*s, 0, 25*s);
	n +=drawCube(mat);

	for (var i = 20; i<31; ++i){
		if (i%3 == 0){
			mat.setTranslate(i*s, 0, s*6.5);
			n += drawCube(mat);
		}
		if (i%3 == 1){
			mat.setTranslate(i*s, 1*s, s*6.5);
			n += drawCube(mat);
		}
		if (i%3 == 2){
			mat.setTranslate(i*s, 2*s, s*6.5);
			n += drawCube(mat);
		}
	}	
	for (var i = 1; i<7; ++i){
		if (i%3 == 0){
			mat.setTranslate(20.5*s, 0, i*s);
			n += drawCube(mat);
		}
		if (i%3 == 1){
			mat.setTranslate(20.5*s, 1*s, i*s);
			n += drawCube(mat);
		}
		if (i%3 == 2){
			mat.setTranslate(20.5*s, 2*s, i*s);
			n += drawCube(mat);
		}
	}

	for (var i = 19; i < 26; i++){
		for (var j = 19; j < 26; ++j){
			mat.setTranslate(s*i, s, s*j);
			m += drawCube(mat);
		}
	}
	for (var i = 20; i < 25; i++){
		for (var j = 20; j < 25; ++j){
			mat.setTranslate(s*i, 2*s, s*j);
			m += drawCube(mat);
		}
	}
	for (var i = 21; i < 24; i++){
		for (var j = 21; j < 24; ++j){
			mat.setTranslate(s*i, 3*s, s*j);
			m += drawCube(mat);
		}
	}
	for (var i = 22; i < 23; i++){
		for (var j = 22; j < 23; ++j){
			mat.setTranslate(s*i, 4*s, s*j);
			m += drawCube(mat);
		}
	}
	for (var i = 20; i<31; ++i){
		mat.setTranslate(i*s, 0, s*7);
		m += drawCube(mat);
		if (i%3 == 0){
			mat.setTranslate(i*s, s, s*7);
			m += drawCube(mat);
		}
		if (i%3 == 1){
			mat.setTranslate(i*s, 2*s, s*7);
			m += drawCube(mat);
		}
		if (i%3 == 2){
			mat.setTranslate(i*s, 3*s, s*7);
			m += drawCube(mat);
		}
	}
	for (var i = 1; i<7; ++i){
		mat.setTranslate(20*s, 0, i*s);
		m += drawCube(mat);
		if (i%3 == 0){
			mat.setTranslate(20*s, s, i*s);
			m += drawCube(mat);
		}
		if (i%3 == 1){
			mat.setTranslate(20*s, 2*s, i*s);
			m += drawCube(mat);
		}
		if (i%3 == 2){
			mat.setTranslate(20*s, 3*s, i*s);
			m += drawCube(mat);
		}
	}

	for (var i = 20; i < 28; ++i){
		for (var j = 4; j < 12; ++j){
			mat.setTranslate(j*s, 4*s, i*s);
			m+= drawCube(mat);
		}
	}
	for (var i = 21; i < 27; ++i){
		for (var j = 5; j < 11; ++j){
			mat.setTranslate(j*s, 3*s, i*s);
			m+= drawCube(mat);
		}
	}
	for (var i = 22; i < 26; ++i){
		for (var j = 6; j < 10; ++j){
			mat.setTranslate(j*s, 2*s, i*s);
			m+= drawCube(mat);
		}
	}

	for (var i = 23; i < 25; ++i){
		for (var j = 7; j < 9; ++j){
			mat.setTranslate(j*s, 1*s, i*s);
			m+= drawCube(mat);
			mat.setTranslate(j*s, 0, i*s);
			m+= drawCube(mat);
		}
	}


	for (var j = 0; j < 5; j++){
		for (var i = 0; i < 32; ++i){
			mat.setTranslate(s*i, s*j, 0);
			o += drawCube(mat);
			mat.setTranslate(0, s*j, s*i);
			o += drawCube(mat);
			mat.setTranslate(31*s, s*j, s*i);
			o += drawCube(mat);
			mat.setTranslate(s*i, s*j, 31*s);
			o += drawCube(mat);
		}
	}


	var temp = [];
	temp.push(new Vector4([ 32*s, 0, 32*s, 1]));
	temp.push(new Vector4([ 0, 0, 32*s, 1]));
	temp.push(new Vector4([ 0, 0, 0, 1]));
		temp.push(new Vector4([ 0, 0, 0, 1]));
		temp.push(new Vector4([ 32*s, 0, 0, 1]));
		temp.push(new Vector4([ 32*s, 0, 32*s, 1]));
	for (var i = 0; i < temp.length; ++i){
		buffer.push(temp[i].elements[0]);
		buffer.push(temp[i].elements[1]);
		buffer.push(temp[i].elements[2]);
		buffer.push(0);
		buffer.push(0);
	}
}