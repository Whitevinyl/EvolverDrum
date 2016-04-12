/**
 * Created by luketwyman on 24/01/2016.
 */


var Pad = [];

var Params = {
    rate: 0.80,
    depth: 0.80
};

var MasterIn, Compressor, Limiter, Reverb, Delay, NoiseBuffer, VelocityEnabled, PitchBend;
var Reverbs = [0,0,0,0,0,0,0,0,0];

function setupAudio() {
    var i;
    Tone.Master.volume.value = 0;
    Limiter = new Tone.Limiter(-1);
    Limiter.toMaster();
    /*Compressor = new Tone.Compressor(-6,25);
    Compressor.toMaster();*/

    MasterIn = Limiter;


    Reverb = new Tone.Freeverb(0.01 + (Math.random()*0.75),3000);
    Reverb.connect(MasterIn);
    Reverb.receive("reverb");


    // NOISE//
    var bufferSize = Tone.context.sampleRate * 2;
    NoiseBuffer = Tone.context.createBuffer(1, bufferSize, Tone.context.sampleRate);
    var output = NoiseBuffer.getChannelData(0);
    for (i=0; i<bufferSize; i++) {
        output[i] = (Math.random()*2) - 1;
    }

    Pad[0] = new Tine();
    Pad[1] = new Kick();
    Pad[2] = new Sine();
    Pad[3] = new Hat2();
    Pad[4] = new Hat();
    Pad[5] = new Clap();
    Pad[6] = new Pipe(2);
    Pad[7] = new Pipe(1);
    Pad[8] = new Snare2();


    for (i=0; i<Pad.length; i++) {
        Reverbs[i] = Math.random();
        var channel = Pad[i].Channel;
        channel.send("reverb",channel.gainToDb(Reverbs[i]));
    }

    VelocityEnabled = true;
    PitchBend = 1;
}



function Envelope() {
    this.Ctx = Tone.context;
    this.ADSR = this.Ctx.createGain();
    this.ADSR.gain.value = 0.001;
}
Envelope.prototype.trigger = function(time,g,a,d,s,r) {
    this.ADSR.gain.setValueAtTime(0.001, time);
    this.ADSR.gain.linearRampToValueAtTime(g, time + a);
    this.ADSR.gain.linearRampToValueAtTime(s*g, time + a + d);
    this.ADSR.gain.linearRampToValueAtTime(0.001, time + a + d + r);
};
Envelope.prototype.connect = function(dest) {
    this.ADSR.connect(dest);
};



//-------------------------------------------------------------------------------------------
//  TINE
//-------------------------------------------------------------------------------------------


function Tine() {
    this.Channel = new Tone.Volume(-18);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Tine.prototype.setup = function() {

    this.Attack = 0.01 + (Math.random()*0.01);
    this.Decay = 0.05 + (Math.random()*0.05);
    this.Sustain = 0.05 + (Math.random()*0.15);
    this.Release = 0.2 + (Math.random()*0.6);
    this.Freq = (650 + Math.round(Math.random()*10)) * PitchBend; // 650

    // construct //
    this.Osc = this.Ctx.createOscillator();
    this.Osc.frequency.value = this.Freq;
    this.Envelope = new Envelope();
    var partials = TinePartials(10 + (Math.round(Math.random()*20)));
    SetPeriodicWave(this.Osc,partials,0);

    // connect //
    this.Osc.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Channel);
};

Tine.prototype.trigger = function(v) {
    this.setup();
    v = v || 128;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Osc.start();
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
    Illuminate(this,velocity,this.Attack+this.Decay+this.Release);
};

//-------------------------------------------------------------------------------------------
//  KICK
//-------------------------------------------------------------------------------------------


function Kick() {
    this.Attack = 0.005;
    this.Channel = new Tone.Volume(-2);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Kick.prototype.setup = function() {

    //this.Attack = 0.01 + (Math.random()*0.01);
    this.Decay = 0.08 + (Math.random()*0.08);
    this.Sustain = 0.15 + (Math.random()*0.2);
    this.Release = 0.3 + (Math.random()*0.5);
    this.Release = 0.1 + (Math.random()*0.3);
    this.Freq = (40 + Math.round(Math.random()*3)) * PitchBend;
    this.FreqOffset = - (10 + Math.round(Math.random()*10));
    this.Ratio = 0.5 + (Math.random()*0.25);
    this.Ratio = 0.75;

    /*this.Osc = new Tone.Oscillator(this.Freq + 60,"triangle");
    this.Osc2 = new Tone.Oscillator(this.Freq + 60 + this.FreqOffset,"sine");
*/

    this.Osc = this.Ctx.createOscillator();
    this.Osc.type = "triangle";
    this.Osc.frequency.value = this.Freq*2.5;

    this.Osc2 = this.Ctx.createOscillator();
    this.Osc2.type = "sine";
    this.Osc2.frequency.value = (this.Freq*2.5) * this.Ratio;

    this.Envelope = new Envelope();



    this.Osc.connect(this.Envelope.ADSR);
    this.Osc2.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Channel);

};

Kick.prototype.trigger = function(v) {
    this.setup();
    v = v || 128;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Osc.start();
    this.Osc.frequency.setValueAtTime(this.Freq*2.5, now);
    this.Osc.frequency.exponentialRampToValueAtTime(this.Freq,now + this.Decay);
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.Osc2.start();
    this.Osc2.frequency.setValueAtTime((this.Freq*2.5) * this.Ratio, now);
    this.Osc2.frequency.exponentialRampToValueAtTime(this.Freq * this.Ratio,now + this.Decay);
    this.Osc2.stop(now + (this.Attack + this.Decay + this.Release));

    /*this.Osc.start();
    this.Osc.frequency.exponentialRampToValue(this.Freq,this.Decay);
    this.Osc.stop("+" + (this.Attack + this.Decay + this.Release));
    this.Osc2.start();
    this.Osc2.frequency.exponentialRampToValue(this.Freq + this.FreqOffset,this.Decay);
    this.Osc2.stop("+" + (this.Attack + this.Decay + this.Release));*/

    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
    Illuminate(this,velocity,this.Attack+this.Decay+this.Release);
};

//-------------------------------------------------------------------------------------------
//  SINE
//-------------------------------------------------------------------------------------------


function Sine() {
    this.Channel = new Tone.Volume(-8);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Sine.prototype.setup = function() {

    if (this.Osc) {
        var now = this.Ctx.currentTime;
        this.GainWrapper.gain.setValueAtTime(1, now);
        this.GainWrapper.gain.linearRampToValueAtTime(0, now + 0.1);
    }

    this.Freq = (120 - Math.round(Math.random()*80)) * PitchBend;
    this.Attack = 0.01 + (Math.random()*0.06);
    this.Decay = 2.6 + (Math.random()*0.8);
    this.Sustain = 0.15 + (Math.random()*0.1);
    this.Release = 0.4 + (Math.random()*0.2);

    /*this.Osc = new Tone.Oscillator(this.Freq,"triangle");
    this.Osc.volume.value = -10;
    this.Osc2 = new Tone.Oscillator(this.Freq,"sine");
    */


    this.Osc = this.Ctx.createOscillator();
    this.Osc.type = "triangle";
    this.Osc.frequency.value = this.Freq;

    this.Osc2 = this.Ctx.createOscillator();
    this.Osc2.type = "sine";
    this.Osc2.frequency.value = this.Freq;

    this.OscVol = new Tone.Volume(-10);
    this.Envelope = new Envelope();
    this.GainWrapper = this.Ctx.createGain();


    this.Osc.connect(this.OscVol);
    this.OscVol.connect(this.Envelope.ADSR);
    this.Osc2.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.GainWrapper);
    this.GainWrapper.connect(this.Channel);

};

Sine.prototype.trigger = function(v) {
    this.setup();
    v = v || 128;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Osc.start();
    this.Osc.frequency.setValueAtTime(this.Freq, now);
    this.Osc.frequency.exponentialRampToValueAtTime(20,now + this.Decay);
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.Osc2.start();
    this.Osc2.frequency.setValueAtTime(this.Freq, now);
    this.Osc2.frequency.exponentialRampToValueAtTime(20,now + this.Decay);
    this.Osc2.stop(now + (this.Attack + this.Decay + this.Release));

    /*this.Osc.start();
     this.Osc.frequency.exponentialRampToValue(20,this.Decay);
     this.Osc.stop("+" + (this.Attack + this.Decay + this.Release));
     this.Osc2.start();
     this.Osc2.frequency.exponentialRampToValue(20,this.Decay);
     this.Osc2.stop("+" + (this.Attack + this.Decay + this.Release));*/

    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
    Illuminate(this,velocity,this.Attack+this.Decay+this.Release);
};

//-------------------------------------------------------------------------------------------
//  TIME 2
//-------------------------------------------------------------------------------------------


function Tine2() {
    this.Channel = new Tone.Volume(-8);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Tine2.prototype.setup = function() {

    this.Attack = 0.005 + (Math.random()*0.005);
    this.Decay = 0.01 + (Math.random()*0.02);
    this.Sustain = 0.05 + (Math.random()*0.15);
    this.Release = 0.1 + (Math.random()*0.1);
    this.Freq = (900 + Math.round(Math.random()*6)) * PitchBend;

    // construct //
    this.Osc = this.Ctx.createOscillator();
    this.Osc.frequency.value = this.Freq;
    this.Envelope = new Envelope();
    var partials = HatPartials(15 + (Math.round(Math.random()*20)),1);
    SetPeriodicWave(this.Osc,partials,0);

    this.BandPass = this.Ctx.createBiquadFilter();
    this.BandPass.type = "bandpass";
    this.BandPass.frequency.value = 10000;
    this.HighPass = this.Ctx.createBiquadFilter();
    this.HighPass.type = "highpass";
    this.HighPass.frequency.value = 7000;

    // connect //
    this.Osc.connect(this.BandPass);
    this.BandPass.connect(this.HighPass);
    this.HighPass.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Channel);
};

Tine2.prototype.trigger = function(v) {
    this.setup();
    v = v || 128;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Osc.start();
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
    Illuminate(this,velocity,this.Attack+this.Decay+this.Release);
};

//-------------------------------------------------------------------------------------------
//  HAT
//-------------------------------------------------------------------------------------------


function Hat() {
    this.Channel = new Tone.Volume(-8);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Hat.prototype.setup = function() {

    this.Attack = 0.005 + (Math.random()*0.005);
    this.Decay = 0.01 + (Math.random()*0.02);
    this.Sustain = 0.05 + (Math.random()*0.15);
    this.Release = 0.1 + (Math.random()*0.1);
    this.Freq = (500 + Math.round(Math.random()*6)) * PitchBend;

    // construct //
    this.Osc = this.Ctx.createOscillator();
    this.Osc.frequency.value = this.Freq;
    this.Envelope = new Envelope();
    var partials = HatPartials(15 + (Math.round(Math.random()*20)),1);
    SetPeriodicWave(this.Osc,partials,0);

    this.BandPass = this.Ctx.createBiquadFilter();
    this.BandPass.type = "bandpass";
    this.BandPass.frequency.value = 10000;
    this.HighPass = this.Ctx.createBiquadFilter();
    this.HighPass.type = "highpass";
    this.HighPass.frequency.value = 7000;

    // connect //
    this.Osc.connect(this.BandPass);
    this.BandPass.connect(this.HighPass);
    this.HighPass.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Channel);
};

Hat.prototype.trigger = function(v) {
    this.setup();
    v = v || 128;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Osc.start();
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
    Illuminate(this,velocity,this.Attack+this.Decay+this.Release);
};

//-------------------------------------------------------------------------------------------
//  HAT2
//-------------------------------------------------------------------------------------------


function Hat2() {
    this.Channel = new Tone.Volume(-2);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Hat2.prototype.setup = function() {

    this.Attack = 0.005 + (Math.random()*0.005);
    this.Decay = 0.01 + (Math.random()*0.01);
    this.Sustain = 0.05 + (Math.random()*0.15);
    this.Release = 0.05 + (Math.random()*0.05);
    this.Freq = (40 + Math.round(Math.random()*6)) * PitchBend;

    // construct //
    this.Osc = this.Ctx.createOscillator();
    this.Osc.frequency.value = this.Freq;
    this.Envelope = new Envelope();
    var partials = HatPartials(80 + (Math.round(Math.random()*10)),2);
    SetPeriodicWave(this.Osc,partials,0);

    this.BandPass = this.Ctx.createBiquadFilter();
    this.BandPass.type = "bandpass";
    this.BandPass.frequency.value = 10000;
    this.HighPass = this.Ctx.createBiquadFilter();
    this.HighPass.type = "highpass";
    this.HighPass.frequency.value = 3000;

    // connect //
    this.Osc.connect(this.BandPass);
    this.BandPass.connect(this.HighPass);
    this.HighPass.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Channel);
};

Hat2.prototype.trigger = function(v) {
    this.setup();
    v = v || 128;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Osc.start();
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
    Illuminate(this,velocity,this.Attack+this.Decay+this.Release);
};

//-------------------------------------------------------------------------------------------
//  CLAP
//-------------------------------------------------------------------------------------------


function Clap() {
    this.Tremolo = new Tone.Tremolo(25,0.3);
    this.Tremolo.type = "sawtooth";
    this.Tremolo.spread = 5;
    this.Tremolo.start();
    this.Channel = new Tone.Volume(10);
    this.Input = new Tone.Mono();
    this.Input.connect(this.Tremolo);
    this.Tremolo.connect(this.Channel);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Clap.prototype.setup = function() {

    // randomisation //
    this.Attack = 0.005 + (Math.random()*0.005);
    this.Decay = 0.05 + (Math.random()*0.05);
    this.Sustain = 0.1 + (Math.random()*0.1);
    this.Release = 0.3 + (Math.random()*0.3);
    this.Freq = (600 - Math.round(Math.random()*400)) * PitchBend;
    this.Freq2 = (1300 - Math.round(Math.random()*100)) * PitchBend;
    this.Tremolo.frequency.value = 30 - Math.round(Math.random()*20);
    this.Tremolo.depth.value = 0.1 + Math.round(Math.random()*0.7);

    // construct //
    this.Noise = this.Ctx.createBufferSource();
    this.Noise.buffer = NoiseBuffer;
    this.Envelope = new Envelope();

    this.BandPass = this.Ctx.createBiquadFilter();
    this.BandPass.type = "bandpass";
    this.BandPass.frequency.value = this.Freq2;
    this.HighPass = this.Ctx.createBiquadFilter();
    this.HighPass.type = "highpass";
    this.HighPass.frequency.value = 850;

    // connect //
    this.Noise.connect(this.BandPass);
    this.BandPass.connect(this.HighPass);
    this.HighPass.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Input);

};

Clap.prototype.trigger = function(v) {
    this.setup();
    v = v || 128;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Noise.start();
    this.Noise.stop(now + (this.Attack + this.Decay + this.Release));
    this.BandPass.frequency.setValueAtTime(this.Freq2, now);
    this.BandPass.frequency.exponentialRampToValueAtTime(this.Freq2 - 50,now + this.Decay);
    this.BandPass.frequency.exponentialRampToValueAtTime(this.Freq,now + this.Decay + this.Release);
    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
    Illuminate(this,velocity,this.Attack+this.Decay+this.Release);
};

//-------------------------------------------------------------------------------------------
//  SNARE
//-------------------------------------------------------------------------------------------


function Snare() {
    this.Channel = new Tone.Volume(-8);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Snare.prototype.setup = function() {

    // randomisation //
    this.Attack = 0.005 + (Math.random()*0.005);
    this.Decay = 0.04 + (Math.random()*0.02);
    this.Sustain = 0.05 + (Math.random()*0.05);
    this.Release = 0.2 + (Math.random()*0.2);
    this.Freq = (4000 - Math.round(Math.random()*400)) * PitchBend;
    this.Freq2 = (3600 - Math.round(Math.random()*100)) * PitchBend;

    // construct //
    this.Noise = this.Ctx.createBufferSource();
    this.Noise.buffer = NoiseBuffer;
    this.Envelope = new Envelope();

    this.Osc = this.Ctx.createOscillator();
    this.Osc.frequency.value = 100;
    this.Osc.type = "triangle";
    this.Envelope2 = new Envelope();
    /*var partials = SnarePartials(15 + (Math.round(Math.random()*20)));
    SetPeriodicWave(this.Osc,partials,0);*/

    this.BandPass = this.Ctx.createBiquadFilter();
    this.BandPass.type = "bandpass";
    this.BandPass.frequency.value = this.Freq2;
    this.HighPass = this.Ctx.createBiquadFilter();
    this.HighPass.type = "highpass";
    this.HighPass.frequency.value = 1100;

    // connect //
    this.Noise.connect(this.HighPass);
    //this.BandPass.connect(this.HighPass);
    this.HighPass.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Channel);
    this.Osc.connect(this.Envelope2.ADSR);
    this.Envelope2.connect(this.Channel);

};

Snare.prototype.trigger = function(v) {
    this.setup();
    v = v || 128;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Noise.start();
    this.Noise.stop(now + (this.Attack + this.Decay + this.Release));
    this.Osc.start();
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.HighPass.frequency.setValueAtTime(1100, now);
    this.HighPass.frequency.exponentialRampToValueAtTime(1100,now + this.Decay);
    this.HighPass.frequency.exponentialRampToValueAtTime(500,now + this.Decay + this.Release);
    /*this.BandPass.frequency.setValueAtTime(this.Freq2, now);
    this.BandPass.frequency.exponentialRampToValueAtTime(this.Freq2 - 50,now + this.Decay);
    this.BandPass.frequency.exponentialRampToValueAtTime(this.Freq,now + this.Decay + this.Release);*/
    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
    this.Envelope2.trigger(now,velocity*0.7,this.Attack,this.Decay*0.25,this.Sustain,this.Release*0.25);
    Illuminate(this,velocity,this.Attack+this.Decay+this.Release);
};



function Snare2() {
    this.Channel = new Tone.Volume(-5);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Snare2.prototype.setup = function() {

    // randomisation //
    this.Attack = 0.005 + (Math.random()*0.005);
    this.Decay = 0.04 + (Math.random()*0.02);
    this.Sustain = 0.05 + (Math.random()*0.05);
    this.Release = 0.2 + (Math.random()*0.2);
    this.Freq = (3000 - Math.round(Math.random()*200)) * PitchBend;
    this.Freq2 = (4400 - Math.round(Math.random()*200)) * PitchBend;

    // construct //
    this.Noise = this.Ctx.createBufferSource();
    this.Noise.buffer = NoiseBuffer;
    this.Envelope = new Envelope();

    this.Osc = this.Ctx.createOscillator();
    this.Osc.frequency.value = 100;
    this.Osc.type = "triangle";
    this.Envelope2 = new Envelope();
    /*var partials = SnarePartials(15 + (Math.round(Math.random()*20)));
     SetPeriodicWave(this.Osc,partials,0);*/

    this.BandPass = this.Ctx.createBiquadFilter();
    this.BandPass.type = "bandpass";
    this.BandPass.frequency.value = this.Freq2;
    this.HighPass = this.Ctx.createBiquadFilter();
    this.HighPass.type = "highpass";
    this.HighPass.frequency.value = 500;

    // connect //
    this.Noise.connect(this.BandPass);
    this.BandPass.connect(this.HighPass);
    this.HighPass.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Channel);
    this.Osc.connect(this.Envelope2.ADSR);
    this.Envelope2.connect(this.Channel);

};

Snare2.prototype.trigger = function(v) {
    this.setup();
    v = v || 128;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Noise.start();
    this.Noise.stop(now + (this.Attack + this.Decay + this.Release));
    this.Osc.start();
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.BandPass.frequency.setValueAtTime(this.Freq2, now);
     this.BandPass.frequency.exponentialRampToValueAtTime(this.Freq - 50,now + this.Decay);
     this.BandPass.frequency.exponentialRampToValueAtTime(this.Freq2,now + this.Decay + this.Release);
    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
    this.Envelope2.trigger(now,velocity*0.7,this.Attack,this.Decay*0.25,this.Sustain,this.Release*0.25);
    Illuminate(this,velocity,this.Attack+this.Decay+this.Release);
};


//-------------------------------------------------------------------------------------------
//  PIPE
//-------------------------------------------------------------------------------------------


function Pipe(mode) {
    this.Channel = new Tone.Volume(-8);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Mode = mode || 1;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Pipe.prototype.setup = function() {

    // randomisation //
    this.Attack = 0.005 + (Math.random()*0.005);
    this.Decay = 0.04 + (Math.random()*0.02);
    this.Sustain = 0.05 + (Math.random()*0.05);
    this.Release = 0.2 + (Math.random()*0.2);
    this.Freq = (500 - Math.round(Math.random()*100)) * PitchBend;
    this.Freq2 = (1800 - Math.round(Math.random()*100)) * PitchBend;
    this.Freq3 = (80) * PitchBend;

    // construct //
    this.Noise = this.Ctx.createBufferSource();
    this.Noise.buffer = NoiseBuffer;
    this.Envelope = new Envelope();

    this.Osc = this.Ctx.createOscillator();
    this.Osc.frequency.value = this.Freq3;
    this.Envelope2 = new Envelope();
    var partials = PipePartials(15 + (Math.round(Math.random()*20)),this.Mode);
     SetPeriodicWave(this.Osc,partials,0);

    this.BandPass = this.Ctx.createBiquadFilter();
    this.BandPass.type = "bandpass";
    this.BandPass.frequency.value = this.Freq2;
    this.HighPass = this.Ctx.createBiquadFilter();
    this.HighPass.type = "highpass";
    this.HighPass.frequency.value = 500;

    // connect //
    this.Noise.connect(this.BandPass);
    this.BandPass.connect(this.HighPass);
    this.HighPass.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Channel);
    this.Osc.connect(this.Envelope2.ADSR);
    this.Envelope2.connect(this.Channel);

};

Pipe.prototype.trigger = function(v) {
    this.setup();
    v = v || 128;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Noise.start();
    this.Noise.stop(now + (this.Attack + this.Decay + this.Release));
    this.Osc.start();
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.Osc.frequency.setValueAtTime(this.Freq3, now);
    this.BandPass.frequency.exponentialRampToValueAtTime(this.Freq3 + 10,now + this.Decay);
    this.BandPass.frequency.setValueAtTime(this.Freq2, now);
    this.BandPass.frequency.exponentialRampToValueAtTime(this.Freq2 - 100,now + this.Decay);
    this.BandPass.frequency.exponentialRampToValueAtTime(this.Freq,now + this.Decay + this.Release);
    this.Envelope.trigger(now,velocity*0.8,this.Attack,this.Decay,this.Sustain,this.Release);
    this.Envelope2.trigger(now,velocity,this.Attack,this.Decay*0.75,this.Sustain,this.Release*0.75);
    Illuminate(this,velocity,this.Attack+this.Decay+this.Release);
};