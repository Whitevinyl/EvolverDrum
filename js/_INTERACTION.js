/**
 * Created by luketwyman on 25/11/2015.
 */

//-------------------------------------------------------------------------------------------
//  SETUP
//-------------------------------------------------------------------------------------------

function InteractionSetup() {
    var target = canvas;

    // MOUSE //
    target.addEventListener("mousedown", mousePress, false);
    target.addEventListener("mouseup", mouseRelease, false);
    target.addEventListener("mousemove", mouseMove, false);


    // TOUCH //
    target.addEventListener('touchstart', function(event) {
        if (event.targetTouches.length == 1) {
            touch = event.targetTouches[0];
            touchTakeover = true;
        } else {
            touchTakeover = false;
        }
        clickOrTouch();
    }, false);
    target.addEventListener('touchmove', function(event) {
        event.preventDefault();
        if (event.targetTouches.length == 1) {
            touch = event.targetTouches[0];
        }
        mouseMove(event);
    }, false);
    target.addEventListener('touchend', function(event) {
        mouseRelease();
        touchTakeover = false;
    }, false);

    // KEYBOARD //
    window.addEventListener("keydown", keyDown, false);

    // MIDI //
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({
            sysex: false // this defaults to 'false' and we won't be covering sysex in this article.
        }).then(onMIDISuccess, onMIDIFailure);
    } else {
        alert("No MIDI support in your browser.");
    }
}

//-------------------------------------------------------------------------------------------
//  INPUT
//-------------------------------------------------------------------------------------------


function mousePress() {
    mouseIsDown = true;
    rolloverCheck();

    //setTouchPos();
    colourToColour(bgCols[2],bgCols[5],6);

    if (mouseX < (fullX/3)) {
        Pad[0].trigger();
    } else if (mouseX > (fullX/3) && mouseX < ((fullX/3)*2)){
        Pad[1].trigger();
    } else {
        Pad[2].trigger();
    }

}


function mouseRelease() {
    mouseIsDown = false;
}


function mouseMove(event) {

    var x,y;

    if (touchTakeover==true) {
        x = touch.pageX;
        y = touch.pageY;
    } else {
        x = event.pageX;
        y = event.pageY;
    }

    const ratio = getPixelRatio();
    mouseX = x * ratio;
    mouseY = y * ratio;
    rolloverCheck();


    /*if (mouseIsDown) {
        setTouchPos();
    }*/

}

function keyDown(event) {
    switch (event.keyCode) {
        case 81: // q
            Pad[0].trigger();
            break;
        case 87: // w
            Pad[1].trigger();
            break;
        case 69: // e
            Pad[2].trigger();
            break;
        case 65: // a
            Pad[3].trigger();
            break;
        case 83: // s
            Pad[4].trigger();
            break;
        case 68: // d
            Pad[5].trigger();
            break;
        case 90: // z
            Pad[6].trigger();
            break;
        case 88: // x
            Pad[7].trigger();
            break;
        case 67: // c
            Pad[8].trigger();
            break;
        default:

            break;
    }
}


//-------------------------------------------------------------------------------------------
//  CALCULATE
//-------------------------------------------------------------------------------------------


function rolloverCheck() {
    //playOver = hudCheck(dx - (32*units),dy + (8*units) + (midType*0.9),64*units,64*units);
}

function hudCheck(x,y,w,h) { // IS CURSOR WITHIN GIVEN BOUNDARIES
    var mx = mouseX;
    var my = mouseY;
    return (mx>x && mx<(x+w) && my>y && my<(y+h));
}


// DETERMINE CLICK //
function clickOrTouch(event) {

    var x,y;

    if (touchTakeover==true) {
        x = touch.pageX;
        y = touch.pageY;
    } else {
        x = event.pageX;
        y = event.pageY;
    }

    const ratio = getPixelRatio();
    mouseX = x * ratio;
    mouseY = y * ratio;

    if (mouseIsDown==false) {
        mousePress(event);
    }
}

function setTouchPos() {
    genW = Math.round(((mouseX / fullX) * 65) + 3);
    var lastSpeed = CrossFadeSpeed;
    CrossFadeSpeed = (((mouseY / fullY) * 7)) + 0.2;
    //CrossFadeLFO.frequency.value = (1.75 - ((mouseY / fullY) * 1.75)) + 0.005;
    touchPos.x = mouseX;
    touchPos.y = mouseY;

    if (CrossFadeSpeed<lastSpeed) {
        if (fadeTween) {
            fadeTween.stop();
        }
        if (colTween) {
            colTween.stop();
        }
        crossFadeTo(CrossFade,CrossFadePolarity,CrossFadeSpeed);
    }

}

//-------------------------------------------------------------------------------------------
//  MIDI
//-------------------------------------------------------------------------------------------


// midi functions
function onMIDISuccess(midiAccess) {
    // when we get a succesful response, run this code
    console.log('MIDI Access Object', midiAccess);
    midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status

    var inputs = midi.inputs.values();
    // loop over all available inputs and listen for any MIDI input
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        // each time there is a midi message call the onMIDIMessage function
        input.value.onmidimessage = onMIDIMessage;
    }
    midi.onstatechange = onStateChange;
}

function onMIDIFailure(e) {
    // when we get a failed response, run this code
    console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
}

function onMIDIMessage(message) {
    data = message.data; // this gives us our [command/channel, note, velocity] data.
    //console.log('MIDI data', data); // MIDI data [144, 63, 73]

    data = event.data,
        cmd = data[0] >> 4,
        channel = data[0] & 0xf,
        type = data[0] & 0xf0, // channel agnostic message type. Thanks, Phil Burk.
        note = data[1],
        velocity = data[2];
    // with pressure and tilt off
    // note off: 128, cmd: 8
    // note on: 144, cmd: 9
    // pressure / tilt on
    // pressure: 176, cmd 11:
    // bend: 224, cmd: 14

    switch (type) {
        case 144: // noteOn message
            if (velocity > 0) {
                noteOn(note, velocity);
            }
            break;
        case 128: // noteOff message
            break;
        case 224: // pitch bend
            PitchBend = Tone.Master.intervalToFrequencyRatio(velocity - 64);
            break;
    }
}

function onStateChange(event) {
    var port = event.port,
        state = port.state,
        name = port.name,
        type = port.type;
    if (type == "input") console.log("name", name, "port", port, "state", state);
}

function noteOn(midiNote, velocity) {

    //colourToColour(bgCols[2],bgCols[5],6);

    switch(midiNote) {
        case 58:
            Pad[0].trigger(velocity);
            break;
        case 59:
            Pad[1].trigger(velocity);
            break;
        case 60:
            Pad[2].trigger(velocity);
            break;
        case 61:
            Pad[3].trigger(velocity);
            break;
        case 62:
            Pad[4].trigger(velocity);
            break;
        case 63:
            Pad[5].trigger(velocity);
            break;
        case 64:
            Pad[6].trigger(velocity);
            break;
        case 65:
            Pad[7].trigger(velocity);
            break;
        case 66:
            Pad[8].trigger(velocity);
            break;
        default:
            break;
    }
}