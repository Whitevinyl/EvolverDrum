
var cTween;
var zipperOsc, zipperChorus;

//-------------------------------------------------------------------------------------------
//  SETUP, CONNECT & START OSC
//-------------------------------------------------------------------------------------------

function zipperTest() {
    zipperOsc = new Tone.Oscillator(220);
    zipperChorus = new Tone.Chorus();
    zipperOsc.connect(zipperChorus);
    zipperChorus.toMaster();
    zipperOsc.start();

    chorusTween(3);
    zipperUpdate();
}

//-------------------------------------------------------------------------------------------
//  TWEEN
//-------------------------------------------------------------------------------------------

function chorusTween(t) {
    t = t || 1000;

    var cPos = {value: zipperChorus.delayTime };
    cTween = new TWEEN.Tween(cPos);
    cTween.to({ value: 1 + (Math.random()*10)  }, t*1000);
    cTween.start();
    cTween.onUpdate(function() {
        zipperChorus.delayTime = this.value;
    });
    cTween.onComplete(function() {
        chorusTween(t);
    });
    cTween.easing( TWEEN.Easing.Quadratic.InOut );
}

//-------------------------------------------------------------------------------------------
//  UPDATE
//-------------------------------------------------------------------------------------------

function zipperUpdate() {
    if (TWEEN) {
        TWEEN.update();
    }
    requestAnimationFrame(zipperUpdate);
}