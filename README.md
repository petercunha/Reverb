# Reverb
Reverb is a simple audio visualizer that uses the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) to extract live [waveforms](https://en.wikipedia.org/wiki/Waveform) of audio files. Rendering is done to the HTML5 Canvas.

- Visualize any audio file you want!
- Written in plain JavaScript, visualizations done in HTML5 Canvas.
- No server required. Everything is served statically.

[Try the demo](https://reverb.surge.sh)

## Preview

![Reverb Demo](demo.gif)

## Installation

This will download the git repository, install the required NPM modules, build them, and serve the files.

```
git clone https://github.com/petercunha/Reverb.git
cd Reverb
npm install
npx parcel index.html --open
```

Then open `http://localhost:1234` in your browser.
