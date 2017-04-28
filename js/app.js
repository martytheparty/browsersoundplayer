// create web audio api context
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();


var cachedSamples = {};

var samplePlaying1 = false;
var samplePlaying2 = false;
var samplePlaying3 = false;


function isPlaying() {
  return (samplePlaying1 || samplePlaying2 || samplePlaying3);
}

var sampleStart = false;
var sampleEnd = false;

var samplesDiv = document.getElementById('samples');
var sample = [];
var saveSample = false;

var analyser = audioCtx.createAnalyser();
var analyser220 = audioCtx.createAnalyser();
var analyser330 = audioCtx.createAnalyser();
var analyser440 = audioCtx.createAnalyser();

analyser.fftSize = 2048;
analyser220.fftSize = 2048;
analyser330.fftSize = 2048;
analyser440.fftSize = 2048;

var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(dataArray);

var bufferLength220 = analyser220.frequencyBinCount;
var dataArray220 = new Uint8Array(bufferLength220);
analyser220.getByteTimeDomainData(dataArray220);

var bufferLength330 = analyser330.frequencyBinCount;
var dataArray330 = new Uint8Array(bufferLength330);
analyser330.getByteTimeDomainData(dataArray330);

var bufferLength440 = analyser440.frequencyBinCount;
var dataArray440 = new Uint8Array(bufferLength440);
analyser440.getByteTimeDomainData(dataArray440);

var canvas = document.getElementById("oscilloscope");
var canvasCtx = canvas.getContext("2d");

var canvas220 = document.getElementById("oscilloscope220");
var canvasCtx220 = canvas220.getContext("2d");

var canvas330 = document.getElementById("oscilloscope330");
var canvasCtx330 = canvas330.getContext("2d");

var canvas440 = document.getElementById("oscilloscope440");
var canvasCtx440 = canvas440.getContext("2d");

var count = 1;
function draw() {
  var sliceWidth = canvas.width * 1.0 / bufferLength,
      x = 0;

  function populateDomainData() {
    analyser.getByteTimeDomainData(dataArray);
    analyser220.getByteTimeDomainData(dataArray220);
    analyser330.getByteTimeDomainData(dataArray330);
    analyser440.getByteTimeDomainData(dataArray440);
  }

  function prepareCanvas() {
    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
    canvasCtx.beginPath();

    canvasCtx220.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx220.fillRect(0, 0, canvas.width, canvas.height);
    canvasCtx220.lineWidth = 2;
    canvasCtx220.strokeStyle = 'rgb(0, 0, 0)';
    canvasCtx220.beginPath();

    canvasCtx330.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx330.fillRect(0, 0, canvas.width, canvas.height);
    canvasCtx330.lineWidth = 2;
    canvasCtx330.strokeStyle = 'rgb(0, 0, 0)';
    canvasCtx330.beginPath();

    canvasCtx440.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx440.fillRect(0, 0, canvas.width, canvas.height);
    canvasCtx440.lineWidth = 2;
    canvasCtx440.strokeStyle = 'rgb(0, 0, 0)';
    canvasCtx440.beginPath();

  }

  function updateCanvas() {

    for (var i = 0; i < bufferLength; i++) {

      var v = dataArray[i] / 128.0;
      var y = v * canvas.height / 2;

      if (saveSample) {
        sample.push(Math.floor(y));
      }

      var v220 = dataArray220[i] / 128.0;
      var y220 = v220 * canvas.height / 2;

      var v330 = dataArray330[i] / 128.0;
      var y330 = v330 * canvas.height / 2;

      var v440 = dataArray440[i] / 128.0;
      var y440 = v440 * canvas.height / 2;

      document.getElementById('frequency').innerHTML = y + '/' + y220;
      if (i === 0) {
        canvasCtx.moveTo(x, y);
        canvasCtx220.moveTo(x, y220);
        canvasCtx330.moveTo(x, y330);
        canvasCtx440.moveTo(x, y440);
      } else {
        canvasCtx.lineTo(x, y);
        canvasCtx220.lineTo(x, y220);
        canvasCtx330.lineTo(x, y330);
        canvasCtx440.lineTo(x, y440);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx220.lineTo(canvas.width, canvas.height / 2);
    canvasCtx330.lineTo(canvas.width, canvas.height / 2);
    canvasCtx440.lineTo(canvas.width, canvas.height / 2);
  }

  function writeToCanvas() {
    canvasCtx.stroke();
    canvasCtx220.stroke();
    canvasCtx330.stroke();
    canvasCtx440.stroke();
  }

  if (sample.length === 0) {
    saveSample = true;
  }

  drawVisual = requestAnimationFrame(draw);

  if(isPlaying()) {
    populateDomainData();
    prepareCanvas();
    updateCanvas();
    writeToCanvas();


    if (saveSample) {
      updateSample();
      saveSample = false;
    }
  }

};

draw();


function updateSample() {

  var sampleHtml = '';
  cachedSamples = {};
  samplesDiv.innerHTML = '';


  function createSampleDiv(index, val) {
    /*
      Rules:
      #1: If neither sampleStart or sampleEnd are defined set the sampleStart to the index
    */

    var sampleDiv = document.createElement('span');

    function startAndEndNotSet() {
      return (sampleStart === false && sampleEnd === false);
    }

    function startIsSet() {
      return (sampleStart >= 0);
    }

    function startIsEqualToIndex() {
      return (sampleStart === index);
    }

    function endIsSet() {
      return (sampleEnd);
    }

    function endIsEqualToIndex() {
      return (sampleEnd === index);
    }

    function indexIsGreaterThanStart() {
      return (index > sampleStart);
    }

    function clickSample() {
      if (startAndEndNotSet()) {
        sampleStart = index;
        sampleDiv.className = 'sample start ';
      } else if (startIsSet() && startIsEqualToIndex()) {
        sampleStart = false;
        sampleDiv.className = 'sample ';
      } else if (endIsSet() === false && indexIsGreaterThanStart() === false) {
        cachedSamples[sampleStart].className = 'sample end ';
        sampleEnd = sampleStart;
        sampleStart = index;
        sampleDiv.className = 'sample start ';
      } else if (endIsSet() === false) {
        sampleEnd = index;
        sampleDiv.className = 'sample end ';
      } else if (endIsEqualToIndex()) {
        sampleEnd = false;
        sampleDiv.className = 'sample ';
      }
      alert(index + ' sample start ' + sampleStart + ' sample end ' + sampleEnd);

    }


    sampleDiv.id = 'sample' + index;
    sampleDiv.className = 'sample';
    sampleDiv.innerHTML = val;
    sampleDiv.onclick = clickSample;
    return sampleDiv;
  }

  for(var i = 0; i < sample.length; i++) {
    cachedSamples[i] = createSampleDiv(i, sample[i])
    samplesDiv.appendChild(cachedSamples[i]);
  }

}


// create Oscillator node
var oscillator220  = audioCtx.createOscillator();
var oscillator330  = audioCtx.createOscillator();
var oscillator440  = audioCtx.createOscillator();

function start220() {
    samplePlaying1 = true;
    oscillator220.type = document.getElementById('waveForm220').value;
    //oscillator220.type = 'sine';
    //oscillator220.type = 'sawtooth';
    //oscillator220.type = 'triangle';
    oscillator220.frequency.value = 220; // value in hertz
    oscillator220.connect(audioCtx.destination);
    oscillator220.connect(analyser);
    oscillator220.connect(analyser220);
    oscillator220.start();
}

function stop220() {
  if (samplePlaying1) {
    samplePlaying1 = false;
    oscillator220.stop();
    oscillator220  = audioCtx.createOscillator();
  }
}

function start330() {
  samplePlaying2 = true;
  oscillator330.type = document.getElementById('waveForm330').value;
  oscillator330.frequency.value = 330; // value in hertz
  oscillator330.connect(audioCtx.destination);
  oscillator330.connect(analyser);
  oscillator330.connect(analyser330);
  oscillator330.start();
}

function stop330() {
  if (samplePlaying2) {
    samplePlaying2 = false;
    oscillator330.stop();
    oscillator330  = audioCtx.createOscillator();
  }
}


function start440() {
  samplePlaying3 = true;
  oscillator440.type = document.getElementById('waveForm440').value;
  oscillator440.frequency.value = 440; // value in hertz
  oscillator440.connect(audioCtx.destination);
  oscillator440.connect(analyser);
  oscillator440.connect(analyser440);
  oscillator440.start();
}

function stop440() {
  if (samplePlaying3) {
    samplePlaying3 = false;
    oscillator440.stop();
    oscillator440  = audioCtx.createOscillator();
  }
}

function stopAll() {
  stop220();
  stop330();
  stop440();
}

function startAll() {
  start220();
  start330();
  start440();
}

var stopButtonAll = document.createElement('button');
var stopTextAll = document.createTextNode('Stop All');
stopButtonAll.type = 'button';
stopButtonAll.appendChild(stopTextAll);
stopButtonAll.onclick = stopAll;
buttonsAll.appendChild(stopButtonAll);

var startButtonAll = document.createElement('button');
var startTextAll = document.createTextNode('Start All');
startButtonAll.type = 'button';
startButtonAll.appendChild(startTextAll);
startButtonAll.onclick = startAll;
buttonsAll.appendChild(startButtonAll);

var buttons440 = document.getElementById('buttons440');
var startButton440 = document.createElement('button');
var startText440 = document.createTextNode('start 440');
startButton440.type = 'button';
startButton440.appendChild(startText440);
startButton440.onclick = start440;
buttons440.appendChild(startButton440);

var stopButton440 = document.createElement('button');
var stopText440 = document.createTextNode('stop 440');
stopButton440.type = 'button';
stopButton440.appendChild(stopText440);
stopButton440.onclick = stop440;
buttons440.appendChild(stopButton440);

var buttons220 = document.getElementById('buttons220');
var startButton220 = document.createElement('button');
var startText220 = document.createTextNode('start 220');
startButton220.type = 'button';
startButton220.appendChild(startText220);
startButton220.onclick = start220;
buttons220.appendChild(startButton220);

var stopButton220 = document.createElement('button');
var stopText220 = document.createTextNode('stop 220');
stopButton220.type = 'button';
stopButton220.appendChild(stopText220);
stopButton220.onclick = stop220;
buttons220.appendChild(stopButton220);

var buttons330 = document.getElementById('buttons330');
var startButton330 = document.createElement('button');
var startText330 = document.createTextNode('start 330');
startButton330.type = 'button';
startButton330.appendChild(startText330);
startButton330.onclick = start330;
buttons330.appendChild(startButton330);

var stopButton330 = document.createElement('button');
var stopText330 = document.createTextNode('stop 330');
stopButton330.type = 'button';
stopButton330.appendChild(stopText330);
stopButton330.onclick = stop330;
buttons330.appendChild(stopButton330);


document.getElementById('fft-size').innerHTML = analyser.fftSize;
document.getElementById('bin-count').innerHTML = analyser.frequencyBinCount;

var clearSample = document.getElementById('clearSample');
clearSample.onclick = function () {
  sample = [];
}

var clearEndpoints = document.getElementById('clearEndpoints');
clearEndpoints.onclick = function () {
  cachedSamples[sampleStart].className = 'sample';
  cachedSamples[sampleEnd].className = 'sample';
  sampleStart = false;
  sampleEnd = false;

}
