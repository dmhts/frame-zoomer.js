# FrameZoomerJS
FrameZoomer allows to zoom in certain portions of an image. It doesn't require any dependencies and it will be especially useful if you need to zoom in and highlight some recognized or pre-defined parts of an image with animation.

You are welcome to see the <a href="http://dmgts.github.io/frame-zoomer/">demo</a>.

## Browser support
FrameZoomerJS has been successfully tested in the following browsers: 
* Chrome 
* FF3.6+ 
* IE9+ 
* Safari 5+ 
* Opera 12+
* Mobile Safari (iOS 6+)
* Android 2.3+ 

## Getting started
####1. Install with Bower: 
```
bower install frame-zoomer
```
####2. Connect to your application with script tag:
```
<script src="bower_components/build/frame-zoomer.min.js"></script>
```
or with AMD loader:
```
define(["bower_components/build/frame-zoomer.min.js"], function(FrameZoomer) {
  ...
});
```
####3. Add an image on the page:
```html
<img src="/img/image.jpg" id="image-id" alt="Image" />
```
or create the one by using JS:
```js
var image = new Image();
image.src = "/img/image.jpg";
```
####4. Initialization:
```js
frameZoomer = new FrameZoomer({
    image: window.document.getElementById('image-id') || image,
    zoomWindow: {
        width: 500,
        height: 500
    }
});
```
####5. Usage:
```js
frameZoomer.zoomIn(0, 400, 300, 200);
frameZoomer.drawFrame(0, 400, 300, 200);
frameZoomer.zoomOut();
```

### Options
Available options and their defaults are:
```js
{
  image: new Image()       // HTML Image Element. It is the only required option.
  zoomRatio: 1,            // The zooming ratio
  animationDuration: 1500, // Duration of animation in miliseconds
  zoomWindow: {            // Options of the zoom window
    width: "100%",         // The width of the zoom window in percents or pixels. If specified in px then it has to be less than image.naturalWidth.
    height: "100%"         // The height of the zoom window in percents or pixels. If specified in px then it has to be less than image.naturalHeight.
  },
  frame: {                 // Options of the frame
    padding: 10            // in pixels
    opacity: 0.5,
    background: "green"
  }
}
```

### Methods

#### `zoomIn(x, y, width, height[, onStart, onComplete])`
Zoom in the frame object with animation.

  __Arguments__
  1. `x` _{Number}_: Position of the frame on the x-axis.
  2. `y` _{Number}_: Position of the frame on the y-axis.
  3. `width` _{Number}_: Width of the frame in pixels.
  4. `height` _{Number}_: Height of the frame in pixels.
  5. `onStart` _{Function}_: A callback function which is called on the start of animation.
  6. `onComplete` _{Function}_: A callback function which is called on the end of animation.
  
  _Note_: Callback functions take first argument as the object with animation parameters.

#### `zoomOut()`
Zoom out the frame object without animation.
  
#### `drawFrame(x, y, width, height)`
Draws the frame object over the image.
_Note_: Mostly you do not need to call it directly.

  __Arguments__
  1. `x` _{Number}_: Position of the frame on the x-axis.
  2. `y` _{Number}_: Position of the frame on the y-axis.
  3. `width` _{Number}_: Width of the frame in pixels.
  4. `height` _{Number}_: Height of the frame in pixels.
  
### Approximate todo list:
1. Add the external padding for the frame.
2. Add animation for the zoomOut method.
3. Add possibility for manual scrolling inside the zoom window.
4. Add more test.
4. Your item...