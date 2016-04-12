/**
 * Created by luketwyman on 03/11/2014.
 */



// INIT //
var canvas;
var cxa;
var scene = 0;
var TWEEN;


// METRICS //
var halfX = 0;
var halfY = 0;
var fullX = 0;
var fullY = 0;
var units = 0;
var dx = halfX;
var dy = halfY;
var headerType = 0;
var midType = 0;
var dataType = 0;
var bodyType = 0;
var subType = 0;
var device = "desktop";
var padsWidth, padsHeight, padWidth, padHeight, padGutter;


// INTERACTION //
var mouseX = 0;
var mouseY = 0;
var touchTakeover = false;
var touch;
var mouseIsDown = false;

var touchPos;


// COLORS //
var bgCols = [new RGBA(23,7,36,1),new RGBA(129,79,114,1),new RGBA(255,159,144,1),new RGBA(255,234,198,1),new RGBA(255,194,173,1),new RGBA(94,234,176,1),new RGBA(0,4,8,1),new RGBA(37,19,32,1)];
var aCols = [
    new RGBA(230,32,78,1),
    new RGBA(230,32,78,1),
    new RGBA(230,32,78,1),

    new RGBA(250,115,97,1),
    new RGBA(250,115,97,1),
    new RGBA(250,115,97,1),

    new RGBA(37,204,193,1),
    new RGBA(37,204,193,1),
    new RGBA(37,204,193,1),

    new RGBA(86,19,117,1),
    new RGBA(86,19,117,1),
    new RGBA(86,19,117,1),

    new RGBA(22,4,36,1),
    new RGBA(22,4,36,1),
    new RGBA(22,4,36,1),
    new RGBA(22,4,36,1),
    new RGBA(22,4,36,1),
    new RGBA(22,4,36,1)
];
var masterCol = new RGBA(0,0,0,0);
var highPass = new RGBA(0,0,0,0);
var lowPass = new RGBA(0,0,0,0);

var NoiseImage = new Image();
NoiseImage.src = "noise.png";




//-------------------------------------------------------------------------------------------
//  INITIALISE
//-------------------------------------------------------------------------------------------


function init() {

    ////////////// SETUP CANVAS ////////////

    canvas = document.getElementById("cnvs");

    InteractionSetup();

    cxa = canvas.getContext("2d");
    cxa.mozImageSmoothingEnabled = false;
    cxa.imageSmoothingEnabled = false;

    // SET CANVAS & DRAWING POSITIONS //
    metrics();

    touchPos = new Point(halfX,halfY);

    // DONE //
    scene = 1;
    draw();

    setupAudio();

} // END INIT




function diceRoll(sides) {
    var dice = Math.floor(Math.random()*sides);
    return (dice===0);
}



//-------------------------------------------------------------------------------------------
//  LOOP
//-------------------------------------------------------------------------------------------




function draw() {
    if (scene==1) {
        update();
        drawBG();
        drawScene();
    }

    requestAnimationFrame(draw,canvas);
}


//-------------------------------------------------------------------------------------------
//  UPDATE
//-------------------------------------------------------------------------------------------



function update() {
    if (TWEEN) {
        TWEEN.update();
    }
    //crossFadePeakAnalyze();

}









