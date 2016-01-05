// RandomUsername (Nikola Jovanovic)
// powerSpheres

//Shader
var gl;
var vPosition, texCoordLoc, projTLoc, modelTLoc, cameraTLoc;

//Camera
var cameraPt = [0, 2, 0, 1];
var lookPt = [0, 2, -1, 1];
var moveDir = 0;
var rotateDir = 0;
var laserDot;

//Elements
var platforms = [];
var trees = [];
var houses = [];
var snowflakes = [];
var wall, sunMoon, grass;
var rAngSun, rAngMoon, rAng, sunMoonH;
var endScreen;

//Game
var powerSphere;
var powerSphereCoords = [0, 2, 0, 0];
var powerSphereClaimed = true;
var score = -1;
var scoreLabel, timeleftLabel;
var XZAng = 180;
var timeStart;

//Textures
var tGrass, tSnowyGrass;
var tWood, tWall, tLeaf, tDirt, tRed;
var tRoof, tSnowyRoof, tFacade, tFlooring, tSun, tMoon;
var tElectric, tElectric2, tElecUsed, tEnd;

//Env
var winter = false;
var t = 0;

// event handling
function setUpEventHandling(canvas){
	document.onkeydown = checkDown;
	document.onkeyup = checkUp;

	function checkDown(e) {
		e = e || window.event;

		if (e.keyCode == '87') {
			moveDir = 1; //W			
		}
		else if (e.keyCode == '83') {
			moveDir = -1; //S
		}
		else if (e.keyCode == '65') {
			rotateDir = 1; //A
		}
		else if (e.keyCode == '68'){
			rotateDir = -1; //D
		   }
		else if (e.keyCode == '84') {
			winter = !winter; //T
		}
		else if (e.keyCode == '70'){
			//F
			var V = subtract(lookPt, cameraPt);
			var S = subtract(powerSphereCoords, cameraPt);
			var ang = Math.abs( Math.acos( dot(V, S)/(length(V) * length(S)) ) );

			console.log(V, S, dot(V, S), length(V), length(S), ang, S);
			if(ang > Math.PI/2.0) return;
			if(length(S) * Math.sin(ang) > PSPHERE_R) return;

			powerSphereClaimed = true;

		   }
	}
	function checkUp(e) {
		e = e || window.event;

		if (e.keyCode == '87') {
			moveDir = 0; //W			
		}
		else if (e.keyCode == '83') {
			moveDir = 0; //S
		}
		else if (e.keyCode == '65') {
			rotateDir = 0; //A
		}
		else if (e.keyCode == '68'){
			rotateDir = 0; //D
		   }
	}
}

window.onload = function init(){

	// initialize
	var canvas = document.getElementById( "gl-canvas" );
	scoreLabel = document.getElementById("score");
	timeleftLabel = document.getElementById("timeleft");
	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }

	gl.viewport( 0, 0, canvas.width, canvas.height );

	gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

	gl.enable(gl.DEPTH_TEST);
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	projTLoc = gl.getUniformLocation(program, "u_proj");
	modelTLoc = gl.getUniformLocation(program, "u_model");
	cameraTLoc = gl.getUniformLocation(program, "u_camera");

	vPosition = gl.getAttribLocation( program, "vPosition" );
	texCoordLoc = gl.getAttribLocation( program, "a_texcoord" );

	// load textures
	tGrass = loadTexture(gl,"res\\grass.jpg");
	tSnowyGrass = loadTexture(gl,"res\\snowygrass.jpg");
	tWood = loadTexture(gl,"res\\wood.jpg");
	tWall = loadTexture(gl,"res\\wall.jpg");
	tLeaf = loadTexture(gl,"res\\leaf.jpg");
	tDirt = loadTexture(gl,"res\\dirt.jpg");
	tRed = loadTexture(gl,"res\\red.png");
	tSnowyRoof = loadTexture(gl,"res\\snowyroof.jpg");
	tRoof = loadTexture(gl,"res\\roof.jpg");
	tFlooring = loadTexture(gl, "res\\flooring.jpg");
	tFacade = loadTexture(gl, "res\\facade.jpg");
	tSun = loadTexture(gl, "res\\sun.jpg");
	tMoon = loadTexture(gl, "res\\moon.jpg");
	tElectric = loadTexture(gl, "res\\electric.jpg");
	tElectric2 = loadTexture(gl, "res\\electric2.jpg");
	tEnd = loadTexture(gl, "res\\gameover.jpg");

	gl.enableVertexAttribArray( vPosition );
	gl.enableVertexAttribArray( texCoordLoc );
	lcg.setSeed(Math.random() * 4294967296);

	// forest

	var forestSz = Math.trunc(RandomInRange(FOREST_SIZE_LO, FOREST_SIZE_HI+1));

	for(var i = 1; i <= forestSz; i++)
	{
		var x = RandomInRange(-GRASS_EDGE+5, GRASS_EDGE-5);
		var z = RandomInRange(-GRASS_EDGE+5, GRASS_EDGE-5);
		trees.push( makeTree(gl, [x, 0, z, 1]) );
		platforms.push(createPlatform(gl, x, z));
	}

	// village

	var villageSz =  Math.trunc(RandomInRange(VILLAGE_SIZE_LO, VILLAGE_SIZE_HI+1));

	for(var i = 1; i <= villageSz; i++)
	{
		var x = RandomInRange(-GRASS_EDGE+5, GRASS_EDGE-5);
		var z = RandomInRange(-GRASS_EDGE+5, GRASS_EDGE-5);
		houses.push(buildHouse(gl, x, z));
	}

	// other objects

	grass = createGrass(gl);
	laserDot = createCube(gl);
	wall = createWall(gl);

	sunMoon = createSphere(gl);
	powerSphere = createSphere(gl);

	rAngSun = RandomInRange(0, 2*Math.PI);
	rAngMoon = RandomInRange(0, 2*Math.PI);

	timeStart = Date.now();

	setUpEventHandling(canvas);
	render();
}

function render() {

	var timeLeft = ROUND_LENGTH - (Date.now() - timeStart);
	timeleftLabel.innerHTML = Math.round(timeLeft/1000);
	if(timeLeft < 0)
	{
		// game over
		timeleftLabel.innerHTML = 0;
		endScreen = createPlatform(gl, 0, 0);

		modelMat = mult(translate(0, -10, 0), mult(scalem(1.2, 1.2, 1.2), rotate(90, [1,0,0])));
		gl.uniformMatrix4fv(modelTLoc, false, flatten(modelMat));

		cameraPt = [0, -10, 1, 1];
		lookPt = [0, -10, 0, 1];

		gl.bindTexture(gl.TEXTURE_2D, tEnd);
		setAttributes(gl, endScreen, vPosition, texCoordLoc);

		gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);
		gl.uniformMatrix4fv(projTLoc, false, flatten(perspective(100, 1, 0.1, 200)));
		gl.uniformMatrix4fv(cameraTLoc, false, flatten(lookAt(cameraPt.slice(0, 3) , lookPt.slice(0, 3), [0,1,0])));
		gl.drawArrays(endScreen.prim, 0, endScreen.n);

		return;
	}

	// seasons

	if(!winter)
	{
		gl.clearColor( 0.40, 0.8, 0.89, 1.0 );
	}
	else
	{
		gl.clearColor( 0.07, 0.38, 0.49, 1.0 );
	}


	gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

	gl.uniformMatrix4fv(projTLoc, false, flatten(perspective(100, 1, 0.1, 200)));

	gl.uniformMatrix4fv(cameraTLoc, false, flatten(lookAt(cameraPt.slice(0, 3) , lookPt.slice(0, 3), [0,1,0])));


	var L = subtract(lookPt, cameraPt);

	//Move and rotate
	if(moveDir == 1)
	{
		var newCameraPt = add(cameraPt, scale(MOVE_STEP, L) );
		var newLookPt = add(lookPt, scale(MOVE_STEP, L) );
		if(newCameraPt[0] >= -WALK_EDGE && newCameraPt[0] <= WALK_EDGE
		&& newCameraPt[2] >= -WALK_EDGE && newCameraPt[2] <= WALK_EDGE)
		{
			cameraPt = newCameraPt;
			lookPt = newLookPt;
		}
	}
	else if(moveDir == -1)
	{
		var newCameraPt = subtract(cameraPt, scale(MOVE_STEP, L) );
		var newLookPt = subtract(lookPt, scale(MOVE_STEP, L) );
		if(newCameraPt[0] >= -WALK_EDGE && newCameraPt[0] <= WALK_EDGE
		&& newCameraPt[2] >= -WALK_EDGE && newCameraPt[2] <= WALK_EDGE)
		{
			cameraPt = newCameraPt;
			lookPt = newLookPt;
		}
	}

	if(rotateDir == 1)
	{
		lookPt = add(mult(rotate(ROT_STEP, [0, 1, 0]), L), cameraPt);
	}
	else if(rotateDir == -1)
	{
		lookPt = add(mult(rotate(-ROT_STEP, [0, 1, 0]), L), cameraPt);
	}

	if(powerSphereClaimed)
	{
		score++;
		scoreLabel.innerHTML = score;
		powerSphereClaimed = false;
		powerSphereCoords[0] = RandomInRange(-GRASS_EDGE+1, GRASS_EDGE-1);
		powerSphereCoords[2] = RandomInRange(-GRASS_EDGE+1, GRASS_EDGE-1);
		powerSphereCoords[1] = 2;
		powerSphereCoords[3] = 1;
		//powerSphereCoords = [0, 2, 0, 0];
	}

	//coord update
	XZAng = RandomInRange(XZAng - 90, XZAng + 90);
	var vAdd = scale( SPHERE_STEP, mult(rotate(XZAng, [0,1,0]), [1,0,0,0]) );
	powerSphereCoords = add(vAdd, powerSphereCoords);

	// speed
	if(powerSphereCoords[0] < -WALK_EDGE) powerSphereCoords[0] = -WALK_EDGE;
	if(powerSphereCoords[0] > WALK_EDGE) powerSphereCoords[0] = WALK_EDGE;
	if(powerSphereCoords[2] < -WALK_EDGE) powerSphereCoords[2] = -WALK_EDGE;
	if(powerSphereCoords[2] > WALK_EDGE) powerSphereCoords[2] = WALK_EDGE;

	//time step update
	if(t % 10 == 0)
	{
		if(t % 20 == 0)
			tElecUsed = tElectric;
		else
			tElecUsed = tElectric2;
	}

	//powerSphere
	gl.bindTexture(gl.TEXTURE_2D, tElecUsed);
	setAttributes(gl, powerSphere, vPosition, texCoordLoc);
	var skal = scalem(PSPHERE_R, PSPHERE_R, PSPHERE_R);
	modelMat = mult(translate(powerSphereCoords[0], powerSphereCoords[1], powerSphereCoords[2]), skal);
	gl.uniformMatrix4fv(modelTLoc, false, flatten(modelMat));
	gl.drawArrays(powerSphere.prim, 0, powerSphere.n);


	//sun
	if(!winter)
	{
		sunMoonH = 80;
		gl.bindTexture(gl.TEXTURE_2D, tSun);
		rAng = rAngSun;
	}
	else
	{
		sunMoonH = 40;
		gl.bindTexture(gl.TEXTURE_2D, tMoon);
		rAng = rAngMoon;
	}
	setAttributes(gl, sunMoon, vPosition, texCoordLoc);
	modelMat = mult(translate(5.0*GRASS_EDGE*Math.sin(rAng), sunMoonH, 5.0*GRASS_EDGE*Math.cos(rAng)), scalem(5, 5, 5));
	gl.uniformMatrix4fv(modelTLoc, false, flatten(modelMat));
	gl.drawArrays(sunMoon.prim, 0, sunMoon.n);

	//laserDot
	var L = add(lookPt, scale(1, subtract(lookPt, cameraPt)));
	modelMat = mult(translate(lookPt[0], lookPt[1], lookPt[2]), scalem(0.005, 0.005, 0.005));
	gl.uniformMatrix4fv(modelTLoc, false, flatten(modelMat));
	setAttributes(gl, laserDot, vPosition, texCoordLoc);
	gl.bindTexture(gl.TEXTURE_2D, tRed);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, laserDot.indxBuffer);
	gl.drawElements(laserDot.primtype, laserDot.nIndices, gl.UNSIGNED_SHORT, 0);

	///house
	gl.bindTexture(gl.TEXTURE_2D, tFacade);
	for(var i in houses){
		modelMat = mult(translate(houses[i].x, 0, houses[i].z), rotate(houses[i].ang, 0, 1, 0));
		gl.uniformMatrix4fv(modelTLoc, false, flatten(modelMat));

		var walls = houses[i].walls;
		setAttributes(gl, walls, vPosition, texCoordLoc);
		gl.drawArrays(walls.primtype, 0, walls.nVerts);
	}
	gl.bindTexture(gl.TEXTURE_2D, tFlooring);
	for(var i in houses){
		modelMat = mult(translate(houses[i].x, 0, houses[i].z), rotate(houses[i].ang, 0, 1, 0));
		gl.uniformMatrix4fv(modelTLoc, false, flatten(modelMat));

		var floor = houses[i].floor;
		setAttributes(gl, floor, vPosition, texCoordLoc);
		gl.drawArrays(floor.primtype, 0, floor.nVerts);
	}
	if(!winter)
	{
		gl.bindTexture(gl.TEXTURE_2D, tRoof);
	}
	else
	{
		gl.bindTexture(gl.TEXTURE_2D, tSnowyRoof);
	}
	for(var i in houses){
		modelMat = mult(translate(houses[i].x, 0, houses[i].z), rotate(houses[i].ang, 0, 1, 0));
		gl.uniformMatrix4fv(modelTLoc, false, flatten(modelMat));

		var roof = houses[i].roof;
		setAttributes(gl, roof, vPosition, texCoordLoc);
		gl.drawArrays(roof.primtype, 0, roof.nVerts);
	}

	//tree
	

	for (var i in trees) {
		for(var j in trees[i]){
			var elem = trees[i][j];
			if(elem.type == 1) //branch
			{
				gl.bindTexture(gl.TEXTURE_2D, tWood);
				var trans = translate(elem.start[0], elem.start[1], elem.start[2]);
				var rot1 = rotate(elem.ang1, [0, 0, -1]);
				var rot2 = rotate(elem.ang2, [-1, 0, 0]);
				modelMat = mult(trans, mult(rot1, rot2));
				gl.uniformMatrix4fv(modelTLoc, false, flatten(modelMat));

				for(var it=0; it<=2; it++)
				{
					gl.bindBuffer(gl.ARRAY_BUFFER, elem.buffs[it]);
					gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
					gl.bindBuffer(gl.ARRAY_BUFFER, elem.textureIdxBuffs[it]);
					gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
					gl.drawArrays(elem.prims[it], 0, elem.ns[it]);
				}
			}
			else if(!winter)
			{
				gl.bindTexture(gl.TEXTURE_2D, tLeaf);
				var trans = translate(elem.start[0], elem.start[1], elem.start[2]);
				var rot = rotate(t*5*elem.rotSgn, [0, 1, 0]);
				console.log(t, elem.rotSgn);
				var scal = scalem(elem.scal, elem.scal, 1);
				modelMat = mult(trans, mult(rot, scal));
				gl.uniformMatrix4fv(modelTLoc, false, flatten(modelMat));
				setAttributes(gl, elem, vPosition, texCoordLoc);
				gl.drawArrays(elem.prim, 0, elem.n);
			}
		}
		var plat = platforms[i];

		if(!winter)
		{
			//tree platform
			gl.bindTexture(gl.TEXTURE_2D, tDirt);
			setAttributes(gl, plat, vPosition, texCoordLoc);
			var trans = translate(plat.x, 0, plat.z);
			modelMat = mult(trans, scalem(1,1,1));
			gl.uniformMatrix4fv(modelTLoc, false, flatten(modelMat));
			gl.drawArrays(plat.prim, 0, plat.n);
		}
		
	}
	


	//grass
	if(!winter)
	{
		gl.bindTexture(gl.TEXTURE_2D, tGrass);
	}
	else
	{
		gl.bindTexture(gl.TEXTURE_2D, tSnowyGrass);
	}
	setAttributes(gl, grass, vPosition, texCoordLoc);
	modelMat = mult(translate(0, -0.001, 0), scalem(GRASS_EDGE, 1, GRASS_EDGE));
	gl.uniformMatrix4fv(modelTLoc, false, flatten(modelMat));
	gl.drawArrays(grass.prim, 0, grass.n);

	//wall
	gl.bindTexture(gl.TEXTURE_2D, tWall);
	setAttributes(gl, wall, vPosition, texCoordLoc);
	modelMat = scalem(GRASS_EDGE, GRASS_EDGE, GRASS_EDGE);
	gl.uniformMatrix4fv(modelTLoc, false, flatten(modelMat));
	gl.drawArrays(wall.prim, 0, wall.n);

	if(winter)
	{
		//flakes
		gl.bindTexture(gl.TEXTURE_2D, loadColorTexture(gl, [0.00, 0.00, 0.00, 1.00]));
		//add new
		var num = Math.trunc(RandomInRange(0, MAX_NEW_FLAKES+1));
		for(var i = 1; i <= num; i++)
		{
			snowflakes.push(createFlake(gl));
		}

		//draw
		var out = [];
		for (var i in snowflakes) {
			var flake = snowflakes[i];

			flake.Y -= SNOW_SPEED;
			modelMat = mult(translate(flake.X, flake.Y, flake.Z), scalem(0.1, 0.1, 0.1));
			gl.uniformMatrix4fv(modelTLoc, false, flatten(modelMat));

			setAttributes(gl, flake, vPosition, texCoordLoc);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, flake.indxBuffer);
			gl.drawElements(flake.primtype, flake.nIndices, gl.UNSIGNED_SHORT, 0);
		
			if(flake.Y <= 0) out.push(i);
		}

		//remove old
		for (var i in out) {
			var idx = out[i];
			snowflakes.splice(idx, 1);
		}
	}
	

	t += TIME_STEP;
	requestAnimFrame( render );
}	
