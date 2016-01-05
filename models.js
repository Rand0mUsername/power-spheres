// RandomUsername (Nikola Jovanovic)
// powerSpheres

// linear congruential generator 
var lcg = (function() {
  	// Set to values from http://en.wikipedia.org/wiki/Numerical_Recipes
      // m is basically chosen to be large (as it is the max period)
      // and for its relationships to a and c
  var m = 4294967296,
      // a - 1 should be divisible by m's prime factors
      a = 1664525,
      // c and m should be co-prime
      c = 1013904223,
      seed, z;
  return {
    setSeed : function(val) {
      z = seed = val || Math.round(Math.random() * m);
    },
    getSeed : function() {
      return seed;
    },
    rand : function() {
      // define the recurrence relationship
      z = (a * z + c) % m;
      // return a float in [0, 1) 
      // if z = m then z / m = 0 therefore (z % m) / m < 1 always
      return z / m;
    }
  };
}());

// returns a random number in range [l, r]
function RandomInRange(l, r){
	return lcg.rand() * (r - l) + l;
}

function setAttributes(gl, obj, vAtribLoc, tcAtribLoc){
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertBuffer);
	gl.vertexAttribPointer(vAtribLoc, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordBuffer);
	gl.vertexAttribPointer(tcAtribLoc, 2, gl.FLOAT, false, 0, 0);
}

function loadTexture(gl,filename){

	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// the texture is being loaded asynchronously so we draw a dummy red pixel until it loads
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				  new Uint8Array([255, 0, 0, 255]));

	// Asynchronously load an image
	var image = new Image();
	image.src = filename;
	image.onload = function(){

	  gl.bindTexture(gl.TEXTURE_2D, texture);

	  // copying pixels to the texture
	  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

	  // mipmaps
	  gl.generateMipmap(gl.TEXTURE_2D);
	}

	return texture;
}

function loadColorTexture(gl, RGBA){

	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	var cols =  new Uint8Array(RGBA);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				 cols);
	gl.generateMipmap(gl.TEXTURE_2D);
	return texture;
}

// grid
function createGrid(xLines, zLines){

	var verts = [];
	var colors = [];

	var width = xLines-1;
	var lenght = zLines-1;
	
	var x=-width/2;
	var z=-lenght/2

	for(var i=0; i<xLines; i++){
			verts.push(x+i, 0, z);
			verts.push(x+i, 0, -z);
			colors.push(1,1,1,1);
			colors.push(1,1,1,1);
	}

	for(var i=0; i<zLines; i++){
			verts.push(x, 0, z+i);
			verts.push(-x, 0, z+i);
			colors.push(1,1,1,1);
			colors.push(1,1,1,1);
	}


	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

	var colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	return {vertBuffer:vertexBuffer, colorBuffer:colorBuffer, vertSize:3, nVerts:verts.length/3, colorSize:4, nColors: colors.length/4, primtype: gl.LINES};
}

// coordinate system
function createCoordSys(gl){

	var verts = [
		//x
		1.0,0.0,0.0, 
		0.0,0.0,0.0,
		//y
		0.0,0.0,0.0,
		0.0,1.0,0.0,
		//z
		0.0,0.0,0.0,
		0.0,0.0,1.0
	];

	var colors = [
		1.0, 0.0, 0.0, 1.0, 
		1.0, 0.0, 0.0, 1.0, 

		0.0, 1.0, 0.0, 1.0, 
		0.0, 1.0, 0.0, 1.0, 

		0.0, 0.0, 1.0, 1.0, 
		0.0, 0.0, 1.0, 1.0
	];

	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

	var colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	return {vertBuffer:vertexBuffer, colorBuffer:colorBuffer, vertSize:3, nVerts:6, colorSize:4, nColors: 6, primtype: gl.LINES};
}

// cube
function createCube(gl) {

	// Vertex Data
	var vertexBuffer;
	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

	var verts = [
		// Front face
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0,

		// Back face
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, -1.0, -1.0,

		// Top face
		-1.0, 1.0, -1.0,
		-1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		1.0, 1.0, -1.0,

		// Bottom face
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0, 1.0,
		-1.0, -1.0, 1.0,

		// Right face
		1.0, -1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,

		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0,
		-1.0, 1.0, 1.0,
		-1.0, 1.0, -1.0
			];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

	// Texture data
	var texCoordBuff = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuff);
	var texCBData = [
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,

		0.0, 0.0,
		0.0, 1.0,
		1.0, 1.0,
		1.0, 0.0,

		0.0, 0.0,
		0.0, 1.0,
		1.0, 1.0,
		1.0, 0.0,

		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,

		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,

		0.0, 0.0,
		0.0, 1.0,
		1.0, 1.0,
		1.0, 0.0
	]; 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCBData), gl.STATIC_DRAW);

	// Index data (defines the triangles to be drawn)
	var cubeIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);

	var cubeIndices = [
		0, 1, 2,      0, 2, 3,    // Front face
		4, 5, 6,      4, 6, 7,    // Back face
		8, 9, 10,     8, 10, 11,  // Top face
		12, 13, 14,   12, 14, 15, // Bottom face
		16, 17, 18,   16, 18, 19, // Right face
		20, 21, 22,   20, 22, 23  // Left face
			];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

	var cube = {vertBuffer:vertexBuffer, texCoordBuffer: texCoordBuff, indxBuffer:cubeIndexBuffer,
		vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices:36,
		primtype: gl.TRIANGLES};

	return cube;
}

// snowflake
function createFlake(gl) {

	// Vertex Data
	var vertexBuffer;
	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

	var verts = [
		// Front face
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0,

		// Back face
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, -1.0, -1.0,

		// Top face
		-1.0, 1.0, -1.0,
		-1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		1.0, 1.0, -1.0,

		// Bottom face
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0, 1.0,
		-1.0, -1.0, 1.0,

		// Right face
		1.0, -1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,

		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0,
		-1.0, 1.0, 1.0,
		-1.0, 1.0, -1.0
			];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

	// Texture data
	var texCoordBuff = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuff);
	var texCBData = [
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,

		0.0, 0.0,
		0.0, 1.0,
		1.0, 1.0,
		1.0, 0.0,

		0.0, 0.0,
		0.0, 1.0,
		1.0, 1.0,
		1.0, 0.0,

		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,

		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,

		0.0, 0.0,
		0.0, 1.0,
		1.0, 1.0,
		1.0, 0.0
	]; 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCBData), gl.STATIC_DRAW);

	// Index data (defines the triangles to be drawn)
	var cubeIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);

	var cubeIndices = [
		0, 1, 2,      0, 2, 3,    // Front face
		4, 5, 6,      4, 6, 7,    // Back face
		8, 9, 10,     8, 10, 11,  // Top face
		12, 13, 14,   12, 14, 15, // Bottom face
		16, 17, 18,   16, 18, 19, // Right face
		20, 21, 22,   20, 22, 23  // Left face
			];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

	x = RandomInRange(-GRASS_EDGE, GRASS_EDGE);
	z = RandomInRange(-GRASS_EDGE, GRASS_EDGE);

	var cube = {vertBuffer:vertexBuffer, texCoordBuffer: texCoordBuff, indxBuffer:cubeIndexBuffer,
		vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices:36,
		primtype: gl.TRIANGLES, X:x, Y:GRASS_EDGE, Z:z};

	return cube;
}

// house
function buildHouse(gl, X, Z) {

	var verts = [
		//floor
		[-4.0, 0.0, 2.0],
		[4.0, 0.0, 2.0], 
		[4.0, 0.0, -2.0],
		[-4.0, 0.0, -2.0],
		//roof
		[-4.0, 4.0, 2.0],
		[4.0, 4.0, 2.0],
		[4.0, 4.0, -2.0], 
		[-4.0, 4.0, -2.0],
		[2.0, 6.0, 0.0], 
		[-2.0, 6.0, 0.0], 
		//door
		[-1.0, 0.0, 2.0], 
		[-1.0, 3.0, 2.0], 
		[1.0, 3.0, 2.0], 
		[1.0, 0.0, 2.0]
	];

	var wallsIdxs =	[4, 0, 7, 3, 6, 2, 5, 1, 13, 12, 5, 11, 4, 10, 0];
	var wallsVerts = [];
	for (var i in wallsIdxs){
		wallsVerts = wallsVerts.concat(verts[ wallsIdxs[i] ]);
	}
	var wallsBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, wallsBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(wallsVerts), gl.STATIC_DRAW );
	var wallsTextureIdxs = [0.0, 1.0, 
							0.0, 0.0, 
							1.0, 1.0,
							1.0, 0.0, 
							3.0, 1.0, 
							3.0, 0.0, 
							4.0, 1.0,
							4.0, 0.0,
							4.75, 0.0,
							4.75, 0.75, 
							4.0, 1.0, 
							5.25, 0.75, 
							6.0, 1.0, 
							5.25, 0.0, 
							6.0, 0.0
	];
    var wallsTextureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, wallsTextureBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(wallsTextureIdxs), gl.STATIC_DRAW);
	//stop

	//floor
	var floorIdxs = [1, 0, 2, 3];
	var floorVerts = [];
	for (var i in floorIdxs){
		floorVerts = floorVerts.concat(verts[ floorIdxs[i] ]);
	}
	var floorBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, floorBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(floorVerts), gl.STATIC_DRAW );
	var floorTextureIdxs = [0.0, 0.0,
							1.0, 0.0,
							1.0, 0.5,
							0.0, 0.5
	];
    var floorTextureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, floorTextureBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorTextureIdxs), gl.STATIC_DRAW);
	//stop

	//roof
	var roofIdxs = [5, 6, 8, 7, 9, 4, 5, 9, 8];
	var roofVerts = [];
	for (var i in roofIdxs){
		roofVerts = roofVerts.concat(verts[ roofIdxs[i] ]);
	}
	var roofBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, roofBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(roofVerts), gl.STATIC_DRAW );
	var roofTextureIdxs = [ 1.0, 0.0, 
							1.0, 0.5, 
							0.75, 0.25, 
							0.0, 0.5,
							0.25, 0.25, 
							0.0, 0.0,
							1.0, 0.0,
							0.25, 0.25, 
							0.75, 0.25
	];
    var roofTextureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, roofTextureBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(roofTextureIdxs), gl.STATIC_DRAW);
	//stop

	var ang = RandomInRange(0, 360);

	var house = {
		x:X, z:Z, ang:ang,
		walls:{ t1:wallsVerts, t2:wallsTextureIdxs, vertBuffer: wallsBuffer, texCoordBuffer: wallsTextureBuffer, nVerts: 15, primtype: gl.TRIANGLE_STRIP},
		floor:{ vertBuffer: floorBuffer, texCoordBuffer: floorTextureBuffer, nVerts: 4, primtype: gl.TRIANGLE_STRIP},
		roof:{ vertBuffer: roofBuffer, texCoordBuffer: roofTextureBuffer, nVerts: 9, primtype: gl.TRIANGLE_STRIP}
	};

	return house;
}

function createCylinder(gl, H, R, start, level) {

	var tick = 1;

	var v1=[], data1=[];
	var v2=[], data2=[];
	var v3=[], data3=[];


	v1 = v1.concat([0, 0, 0]);
	v2 = v2.concat([0, H, 0]);

	data1 = data1.concat([0.5, 0.5]);
	data2 = data2.concat([0.5, 0.5]);

	var endAng = 2.0*Math.PI+tick;
	for(var ang=0; ang<=endAng; ang += tick)
	{
		v1 = v1.concat([R*Math.cos(ang), 0.0, R*Math.sin(ang)]);
		v2 = v2.concat([R*Math.cos(ang), H, R*Math.sin(ang)]);
		
		data1 = data1.concat([0.5*Math.cos(ang)+0.5, 0.5*Math.sin(ang)+0.5]);
		data2 = data2.concat([0.5*Math.cos(ang)+0.5, 0.5*Math.sin(ang)+0.5]);

		v3 = v3.concat([R*Math.cos(ang), 0, R*Math.sin(ang)]);
		v3 = v3.concat([R*Math.cos(ang), H, R*Math.sin(ang)]);

		data3 = data3.concat([ang/endAng, 0.0]);
		data3 = data3.concat([ang/endAng, 1.0]);
	}

	var buff1 = gl.createBuffer();
	var buff2 = gl.createBuffer();
	var buff3 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buff1 );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(v1), gl.STATIC_DRAW );
    gl.bindBuffer( gl.ARRAY_BUFFER, buff2 );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(v2), gl.STATIC_DRAW );
    gl.bindBuffer( gl.ARRAY_BUFFER, buff3 );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(v3), gl.STATIC_DRAW );

	var buffT1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffT1 );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(data1), gl.STATIC_DRAW );
	var buffT2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffT2 );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(data2), gl.STATIC_DRAW );
	var buffT3 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffT3 );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(data3), gl.STATIC_DRAW );

    var v = [0, H, 0, 1];

    //axis1:[0, 0, -1], axis2:[-1,0,0]

    //rot
    var ang1 = RandomInRange(-MAX_ANGLE, MAX_ANGLE);
    var ang2 = RandomInRange(-MAX_ANGLE, MAX_ANGLE);
    if(level == 0)
    {
    	ang1 = ang2 = 0;
    	//trunk
    }

    var rot1 = rotate(ang1, [0, 0, -1]);
	var rot2 = rotate(ang2, [-1, 0, 0]);
    var V = mult(mult(rot1, rot2), v);

    var cylinder = {buffs:[buff1,  buff2, buff3], 
    				textureIdxBuffs:[buffT1, buffT2, buffT3],
    				prims:[gl.TRIANGLE_FAN, gl.TRIANGLE_FAN, gl.TRIANGLE_STRIP],
    				ns:[v1.length/3, v2.length/3, v3.length/3],
					vertSize:3,
					V:V,
					start:start,
					ang1:ang1, ang2:ang2,
					type:1
				   };


	return cylinder;
}

// tree
var tree;

function growTree(gl, start, maxH, maxR, maxBranch, level)
{
	var branching = Math.trunc(RandomInRange(maxBranch*BRANCH_RATIO_LO, maxBranch*BRANCH_RATIO_HI));
	var smallBranching = Math.trunc(RandomInRange(0, SMALL_BRANCH_HI+1));
	if(level == 0) 
	{
		branching = MAX_BRANCH;
		smallBranching = 0;
	}
	if(branching == 0)
	{
		tree.push( createLeaf(gl, start) );
		return;
	}
	for(var i = 1; i <= branching; i++)
	{
		var H = RandomInRange(maxH*HEIGHT_RATIO_LO, maxH*HEIGHT_RATIO_HI);
		var R = RandomInRange(maxR*RADIUS_RATIO_LO, maxR*RADIUS_RATIO_HI);
		var c = createCylinder(gl, H, R, start, level);
		//random rotation of a cylinder
		tree.push(c);
		growTree( gl, add(start, c.V), H, R, branching, level+1);
		if(level == 0 && i == 1) break;
	}
	for(var i = 1; i <= smallBranching; i++)
	{
		var H = RandomInRange(maxH*S_HEIGHT_RATIO_LO, maxH*S_HEIGHT_RATIO_HI);
		var R = RandomInRange(maxR*S_RADIUS_RATIO_LO, maxR*S_RADIUS_RATIO_HI);
		var c = createCylinder(gl, H, R, start, level);
		growTree( gl, add(start, c.V), H, R, 0, level+1);
		//random rotation of a cylinder
		tree.push(c);
	}
}

function makeTree(gl, start)
{
	tree = [];
	growTree(gl, start, MAX_H, MAX_R, MAX_BRANCH, 0);
	return tree;
}

// platform
function createPlatform(gl, x, z)
{
	var tpVerts = new Float32Array([
		-1, 0, 1,
		-1, 0, -1,
		 1, 0, 1,
	 	 1, 0, -1
	 ]);
	var tpBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, tpBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, tpVerts, gl.STATIC_DRAW);

	// Texture data
	var texCoordBuff = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuff);
	var texCBData = [
		0.0, 1.0,
		0.0, 0.0,
		1.0, 1.0,
		1.0, 0.0
	]; 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCBData), gl.STATIC_DRAW);

	var platform = {vertBuffer:tpBuffer, texCoordBuffer: texCoordBuff, 
					vertSize:3, colorSize:4,
					n:4, prim:gl.TRIANGLE_STRIP,
					x:x, z:z
					};


	return platform;
}

// grass
function createGrass(gl)
{
	var tpVerts = new Float32Array([
		1, 0, -1,
		-1, 0, -1,
		1, 0, 1,
	 	-1, 0, 1,
	 ]);
	var tpBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, tpBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, tpVerts, gl.STATIC_DRAW);

	// Texture data
	var texCoordBuff = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuff);

	var TSC = 2.0;
	var texCBData = [
		TSC, 0.0,
		0.0, 0.0,
		TSC, TSC,
		0.0, TSC
	]; 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCBData), gl.STATIC_DRAW);

	var grass = {vertBuffer:tpBuffer, texCoordBuffer: texCoordBuff, 
					vertSize:3,
					n:4, prim:gl.TRIANGLE_STRIP
					};


	return grass;
}

// wall
function createWall(gl){
	var tpVerts = new Float32Array([
		-1, 0, 1,
		-1, 1.0/GRASS_EDGE, 1,
		1, 0, 1,
		1, 1.0/GRASS_EDGE, 1,
		1, 0, -1,
		1, 1.0/GRASS_EDGE, -1,
		-1, 0, -1,
		-1, 1.0/GRASS_EDGE, -1,
		-1, 0, 1,
		-1, 1.0/GRASS_EDGE, 1
	 ]);
	var tpBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, tpBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, tpVerts, gl.STATIC_DRAW);

	// Texture data
	var texCoordBuff = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuff);
	var texCBData = [
		0.0, 0.0,
		0.0, 1.0,
		2.0*GRASS_EDGE, 0.0,
		2.0*GRASS_EDGE, 1.0,
		0.0, 0.0,
		0.0, 1.0,
		2.0*GRASS_EDGE, 0.0,
		2.0*GRASS_EDGE, 1.0,
		0.0, 0.0,
		0.0, 1.0
	]; 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCBData), gl.STATIC_DRAW);

	var platform = {vertBuffer:tpBuffer, texCoordBuffer: texCoordBuff, 
					vertSize:3, colorSize:4,
					n:10, prim:gl.TRIANGLE_STRIP
					};


	return platform;
}

// leaf
function createLeaf(gl, start) {

	// Vertex Data
	var vertexBuffer;
	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

	var verts = [
		2.0, -2.0, 0.0,
		0.0, 0.0, 0.0,
		0.0, -5.0, 0.0,
		-2.0, -2.0, 0.0
			];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

	// Texture data
	var texCoordBuff = gl.createBuffer();
	var texCBData = [
		1.0, 0.5,
		0.5, 1.0,
		0.5, 0.0,
		0.0, 0.5
	]; 
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuff);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCBData), gl.STATIC_DRAW);

	var rotSgn = Math.trunc(RandomInRange(0, 2));
	if(rotSgn == 0) rotSgn--;

	var scal = RandomInRange(0.05, 0.2);

	var leaf = {vertBuffer:vertexBuffer, texCoordBuffer: texCoordBuff, 
					vertSize:3, colorSize:4,
					n:4, prim:gl.TRIANGLE_STRIP,
					start:start, type:0, rotSgn:rotSgn,
					scal:scal
					};

	return leaf;
}

// sphere
function createSphere(gl){
	
	//generate all points
	var x,y,z;
	var tick = 0.2;
	
	var A = Math.ceil((Math.PI+tick) / tick);
	var B = Math.ceil((2.0*Math.PI+tick) / tick);

	var verts = [];
	for(var i = 0; i < A; i++){
		verts[i] = new Array(B);
	}

	var a = 0;
	for(var M = 0; M <= (Math.PI+tick); M += tick)
	{
		var R = Math.sin(M);
		y = -Math.cos(M);
		var b = 0;
		for(var P = 0; P <= (2.0*Math.PI+tick); P += tick)
		{
			x = Math.cos(P) * R;
			z = Math.sin(P) * R;
			//(x, y, z)
			verts[a][b] = [x, y, z];
			b++;
		}
		a++;
	}

	var mesh = [];
	var uv = [];
	//stitch triangles
	for(var a = 1; a < A; a++)
	{
		for(var b = 0; b < B; b++)
		{
			mesh = mesh.concat(verts[a][b]);
			mesh = mesh.concat(verts[a-1][b]);
			mesh = mesh.concat(verts[a][(b+1)%B]);
			uv = uv.concat([0.0, 1.0]);
			uv = uv.concat([0.0, 0.0]);
			uv = uv.concat([1.0, 1.0]);

			mesh = mesh.concat(verts[a-1][b]);
			mesh = mesh.concat(verts[a][(b+1)%B]);
			mesh = mesh.concat(verts[a-1][(b+1)%B]);
			uv = uv.concat([0.0, 0.0]);
			uv = uv.concat([1.0, 1.0]);
			uv = uv.concat([1.0, 0.0]);
		}
	}

	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh), gl.STATIC_DRAW);

	var texCoordBuff = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuff);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);

	var sphere = {vertBuffer:vertexBuffer, texCoordBuffer: texCoordBuff, 
				n:(A-1)*B*6, prim:gl.TRIANGLES
				};

	return sphere;
}