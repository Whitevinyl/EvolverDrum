/**
 * Created by luketwyman on 03/11/2014.
 */


//-------------------------------------------------------------------------------------------
//  BG
//-------------------------------------------------------------------------------------------


function drawBG() {

    cxa.globalAlpha = 1;

    fillColor(bgCols[0]);
    cxa.fillRect(0,0,fullX,fullY);
}





//-------------------------------------------------------------------------------------------
//  FOREGROUND
//-------------------------------------------------------------------------------------------




function drawScene() {

    var size = 10 + (Math.random()*2);




    var columns = 3;
    var rows = 3;




    //cxa.fillRect(0,0,padsWidth,fullY);


    var grad = cxa.createLinearGradient(0,0,0,padsHeight);
    grad.addColorStop(0,returnColor(bgCols[2]));
    grad.addColorStop(1,returnColor(bgCols[1]));

    var grad2 = cxa.createLinearGradient(0,0,0,padsHeight);
    grad2.addColorStop(0,returnColor(bgCols[4]));
    grad2.addColorStop(1,returnColor(bgCols[1]));

    //setRGBA(255,255,255,1);


    for (var i=0; i<rows; i++) {

        for (var h=0; h<columns; h++) {
            //fillColor(aCols[11]);
            cxa.fillStyle = grad;
            cxa.fillRect((padWidth + padGutter) * h, (padHeight + padGutter) * i, padWidth, padHeight);
            var n = h + (i*columns);

            if (Pad[n] && Pad[n].Light>0) {
                fillRGBA(bgCols[3].R,bgCols[3].G,bgCols[3].B,Pad[n].Light/255);
                cxa.fillRect((padWidth + padGutter) * h, (padHeight + padGutter) * i, padWidth, padHeight);
            }
        }
    }


    var cellW = padWidth + padGutter;
    var cellH = padHeight + padGutter;
    cxa.globalAlpha = 0.2;
    cxa.fillStyle = grad2;

    cxa.beginPath();
    cxa.moveTo(0,cellH);
    cxa.lineTo(cellW,cellH*2);
    cxa.lineTo(cellW*3,0);
    cxa.lineTo(cellW*3,cellH*3);
    cxa.lineTo(0,cellH*3);
    cxa.closePath();
    cxa.fill();



    cxa.globalAlpha = 1;

    fillRGBA(bgCols[3].R,bgCols[3].G,bgCols[3].B,0.1);

    cxa.beginPath();
    cxa.moveTo(0,cellH*2);
    cxa.lineTo(cellW,cellH);
    cxa.lineTo(cellW*2,cellH*2);
    cxa.lineTo(cellW,cellH*3);
    cxa.lineTo(0,cellH*3);
    cxa.closePath();
    cxa.fill();

    cxa.beginPath();
    cxa.moveTo(cellW,0);
    cxa.lineTo(cellW*2,cellH);
    cxa.lineTo(cellW*3,0);
    cxa.closePath();
    cxa.fill();

    drawNoise(fullX,fullY);
}



//-------------------------------------------------------------------------------------------
//  DRAW FUNCTIONS
//-------------------------------------------------------------------------------------------


function drawNoise(w,y) {

    var rows = Math.ceil(y/300);
    var columns = Math.ceil(w/300);

    for (var i=0; i<rows; i++) {
        for (var h = 0; h < columns; h++) {
            cxa.drawImage(NoiseImage,300*h,300*i,300,300);
        }
    }
}

// PASS COLOUR OBJECT //
/*function setColor(col) {

    // master color filter //
    var red = Math.round(col.R + masterCol.R);
    var green = Math.round(col.G + masterCol.G);
    var blue = Math.round(col.B + masterCol.B);
    var alpha = col.A + masterCol.A;

    // high & low pass color filters //
    var av = ((red + green + blue) / 3);
    var hp = av/255;
    var lp = 1 - (av/255);
    red += Math.round((highPass.R*hp) + (lowPass.R*lp));
    green += Math.round((highPass.G*hp) + (lowPass.G*lp));
    blue += Math.round((highPass.B*hp) + (lowPass.B*lp));

    buildColour(red,green,blue,alpha);
}*/

function fillColor(col) {
    setRGBA(col.R,col.G,col.B,col.A,"fill");
}
function strokeColor(col) {
    setRGBA(col.R,col.G,col.B,col.A,"stroke");
}
function fillRGBA(r,g,b,a) {
    setRGBA(r,g,b,a,"fill");
}
function strokeRGBA(r,g,b,a) {
    setRGBA(r,g,b,a,"stroke");
}
function returnColor(col) {
    return setRGBA(col.R,col.G,col.B,col.A,"string");
}


/*// PASS MANUAL R G B A //
function setRGBA(r,g,b,a) {
    var red = Math.round(r + masterCol.R);
    var green = Math.round(g + masterCol.G);
    var blue = Math.round(b + masterCol.B);
    var alpha = a + masterCol.A;

    // high & low pass color filters //
    var av = ((red + green + blue) / 3);
    var hp = av/255;
    var lp = 1 - (av/255);
    red += Math.round((highPass.R*hp) + (lowPass.R*lp));
    green += Math.round((highPass.G*hp) + (lowPass.G*lp));
    blue += Math.round((highPass.B*hp) + (lowPass.B*lp));

    buildColour(red,green,blue,alpha);
}*/

// PASS R G B A //
function setRGBA(r,g,b,a,mode) {
    // master color filter //
    var red = Math.round(r + masterCol.R);
    var green = Math.round(g + masterCol.G);
    var blue = Math.round(b + masterCol.B);
    var alpha = a + masterCol.A;

    // high & low pass color filters //
    //if (this.Passes) {
        var av = ((red + green + blue) / 3);
        var hp = av/255;
        var lp = 1 - (av/255);
        red += Math.round((highPass.R*hp) + (lowPass.R*lp));
        green += Math.round((highPass.G*hp) + (lowPass.G*lp));
        blue += Math.round((highPass.B*hp) + (lowPass.B*lp));
    //}

    // set to string //
    if (mode==="stroke") {
        cxa.strokeStyle = buildColour(red,green,blue,alpha);
    } else if (mode==="fill"){
        cxa.fillStyle = buildColour(red,green,blue,alpha);
    } else {
        return buildColour(red,green,blue,alpha);
    }
}


function buildColour(red,green,blue,alpha) {
    // RANGE //
    if (red<0) {
        red = 0;
    }
    if (red>255) {
        red = 255;
    }
    if (green<0) {
        green = 0;
    }
    if (green>255) {
        green = 255;
    }
    if (blue<0) {
        blue = 0;
    }
    if (blue>255) {
        blue = 255;
    }
    if (alpha<0) {
        alpha = 0;
    }
    if (alpha>1) {
        alpha = 1;
    }
    return "rgba("+red+","+green+","+blue+","+alpha+")";
}




//-------------------------------------------------------------------------------------------
//  EFFECTS
//-------------------------------------------------------------------------------------------


