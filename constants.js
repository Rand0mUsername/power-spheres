// RandomUsername (Nikola Jovanovic)
// powerSpheres

// constants

var GRASS_EDGE = 20;
var WALK_EDGE = GRASS_EDGE - 1;
var ROUND_LENGTH = 60000;
var TIME_STEP = 1;

var SNOW_SPEED = 0.5;
var MAX_NEW_FLAKES = 1;
var FOREST_SIZE_HI = 3;
var FOREST_SIZE_LO = 1;
var VILLAGE_SIZE_HI = 5;
var VILLAGE_SIZE_LO = 1;

var MOVE_STEP = 0.2;
var ROT_STEP = 2;
var SPHERE_STEP = 0.15;
var PSPHERE_R = 0.5;

// tree constants
var MAX_H = 10;
var MAX_R = 1.0;
var MAX_BRANCH = 4;
var MAX_ANGLE = 60;
var BRANCH_RATIO_LO = 0.5;
var BRANCH_RATIO_HI = 0.8;
var HEIGHT_RATIO_LO = 0.4;
var HEIGHT_RATIO_HI = 0.7;
var RADIUS_RATIO_LO = 0.4;
var RADIUS_RATIO_HI = 0.6;
var SMALL_BRANCH_HI = 4;

var S_HEIGHT_RATIO_LO = 0.1;
var S_HEIGHT_RATIO_HI = 0.4;
var S_RADIUS_RATIO_LO = 0.1;
var S_RADIUS_RATIO_HI = 0.4;