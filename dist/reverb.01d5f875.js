// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"node_modules\\web-audio-analyser\\index.js":[function(require,module,exports) {
var AudioContext = window.AudioContext || window.webkitAudioContext

module.exports = WebAudioAnalyser

function WebAudioAnalyser(audio, ctx, opts) {
  if (!(this instanceof WebAudioAnalyser)) return new WebAudioAnalyser(audio, ctx, opts)
  if (!(ctx instanceof AudioContext)) (opts = ctx), (ctx = null)

  opts = opts || {}
  this.ctx = ctx = ctx || new AudioContext

  if (!(audio instanceof AudioNode)) {
    audio = (audio instanceof Audio || audio instanceof HTMLAudioElement)
      ? ctx.createMediaElementSource(audio)
      : ctx.createMediaStreamSource(audio)
  }

  this.analyser = ctx.createAnalyser()
  this.stereo   = !!opts.stereo
  this.audible  = opts.audible !== false
  this.wavedata = null
  this.freqdata = null
  this.splitter = null
  this.merger   = null
  this.source   = audio

  if (!this.stereo) {
    this.output = this.source
    this.source.connect(this.analyser)
    if (this.audible)
      this.analyser.connect(ctx.destination)
  } else {
    this.analyser = [this.analyser]
    this.analyser.push(ctx.createAnalyser())

    this.splitter = ctx.createChannelSplitter(2)
    this.merger   = ctx.createChannelMerger(2)
    this.output   = this.merger

    this.source.connect(this.splitter)

    for (var i = 0; i < 2; i++) {
      this.splitter.connect(this.analyser[i], i, 0)
      this.analyser[i].connect(this.merger, 0, i)
    }

    if (this.audible)
      this.merger.connect(ctx.destination)
  }
}

WebAudioAnalyser.prototype.waveform = function(output, channel) {
  if (!output) output = this.wavedata || (
    this.wavedata = new Uint8Array((this.analyser[0] || this.analyser).frequencyBinCount)
  )

  var analyser = this.stereo
    ? this.analyser[channel || 0]
    : this.analyser

  analyser.getByteTimeDomainData(output)

  return output
}

WebAudioAnalyser.prototype.frequencies = function(output, channel) {
  if (!output) output = this.freqdata || (
    this.freqdata = new Uint8Array((this.analyser[0] || this.analyser).frequencyBinCount)
  )

  var analyser = this.stereo
    ? this.analyser[channel || 0]
    : this.analyser

  analyser.getByteFrequencyData(output)

  return output
}

},{}],"index.js":[function(require,module,exports) {
input.onchange = function (e) {
    var audio = document.getElementById('audio');
    audio.crossOrigin = 'Anonymous';
    audio.src = URL.createObjectURL(this.files[0]);
    audio.play();
    startVisualizer();

    // Hide file upload div. Show visualizer.
    document.getElementById('step1').style.cssText = "display: none;";
    document.getElementById('step2').style.cssText = "";

    audio.onend = function (e) {
        URL.revokeObjectURL(this.src);
    };
};

document.getElementById('playDefaultLink').onclick = function (e) {
    var audio = document.getElementById('audio');
    audio.play();
    startVisualizer(audio);

    // Hide file upload div. Show visualizer.
    document.getElementById('step1').style.cssText = "display: none;";
    document.getElementById('step2').style.cssText = "";

    audio.onend = function (e) {
        URL.revokeObjectURL(this.src);
    };
};

function startVisualizer(audio) {
    var analyser = require('web-audio-analyser')(audio);
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function update() {
        var audioFreq = analyser.waveform();

        // Clear canvas
        ctx.fillStyle = "black";
        ctx.globalAlpha = 0.4;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;

        // Set line style
        var scaleFactor = 1.5;
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1.5;

        // Draw frequency lines
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2 - audioFreq[0] * scaleFactor);
        for (var i = 0; i < audioFreq.length; i++) {
            ctx.lineTo(canvas.width / audioFreq.length * i, canvas.height / 2 - audioFreq[i] * scaleFactor);
        }

        ctx.moveTo(0, canvas.height / 2 + audioFreq[0] * scaleFactor);
        for (var _i = 0; _i < audioFreq.length; _i++) {
            ctx.lineTo(canvas.width / audioFreq.length * _i, canvas.height / 2 + audioFreq[_i] * scaleFactor);
        }
        ctx.stroke();

        requestAnimationFrame(update);
    }

    update();
}
},{"web-audio-analyser":"node_modules\\web-audio-analyser\\index.js"}],"node_modules\\parcel\\src\\builtins\\hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';

var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };

  module.bundle.hotData = null;
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '6419' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();

      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');

      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);

      removeErrorOverlay();

      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;

  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';

  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["node_modules\\parcel\\src\\builtins\\hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/reverb.01d5f875.map