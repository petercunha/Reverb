input.onchange = function(e){
    var audio = document.getElementById('audio')
    audio.crossOrigin = 'Anonymous'
    audio.src = URL.createObjectURL(this.files[0]);
    audio.play()
    startVisualizer()

    // Hide file upload div. Show visualizer.
    document.getElementById('step1').style.cssText = "display: none;"
    document.getElementById('step2').style.cssText = ""
    
    audio.onend = function(e) {
        URL.revokeObjectURL(this.src);
    }
}

document.getElementById('playDefaultLink').onclick = (e) => {
    var audio = document.getElementById('audio')
    audio.play()
    startVisualizer(audio)

    // Hide file upload div. Show visualizer.
    document.getElementById('step1').style.cssText = "display: none;"
    document.getElementById('step2').style.cssText = ""
    
    audio.onend = function(e) {
        URL.revokeObjectURL(this.src);
    }
}

function startVisualizer(audio) {
    var analyser = require('web-audio-analyser')(audio);
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function update() {
        var audioFreq = analyser.waveform()

        // Clear canvas
        ctx.fillStyle="black";
        ctx.globalAlpha = 0.4;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0

        // Set line style
        var scaleFactor = 1.5;
        ctx.strokeStyle = "white"
        ctx.lineWidth = 1.5;

        // Draw frequency lines
        ctx.beginPath();
        ctx.moveTo(0, canvas.height/2 - audioFreq[0]*scaleFactor);
        for (let i = 0; i < audioFreq.length; i++) {
            ctx.lineTo((canvas.width/audioFreq.length)*i, canvas.height/2 - audioFreq[i]*scaleFactor);
        }

        ctx.moveTo(0, canvas.height/2 + audioFreq[0]*scaleFactor);
        for (let i = 0; i < audioFreq.length; i++) {
            ctx.lineTo((canvas.width/audioFreq.length)*i, canvas.height/2 + audioFreq[i]*scaleFactor);
        }
        ctx.stroke();

        requestAnimationFrame(update);
    }

    update()
}