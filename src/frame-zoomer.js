// Thanks to Paul Irish for this polyfill (https://gist.github.com/paulirish/1579671)
(function() {
    "use strict";

    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
}());

(function (window, undefined) {
    "use strict";

    /**
     * The constructor function
     * @param {Object} options
     * @param {Number} options.zoomRatio
     * @param {Number} options.animationDuration
     * @param {Number} options.framePadding
     * @param {Object} options.zoomWindow
     * @param {(Number|String)} options.zoomWindow.width
     * @param {(Number|String)} options.zoomWindow.frame
     * @param {Object} options.frame
     * @param {Number} options.frame.opacity
     * @param {String} options.frame.background
     * @constructor
     */
    var FrameZoomer = function (options) {
        /**
         * The reference to the current object.
         * @type {FrameZoomer}
         * @private
         */
        var _this = this;

        if (!options) {
            throw new Error("The options object has not been set");
        }

        if (!options.image) {
            throw new Error("The image option has not been set");
        }

        this.options = this.extend({
            zoomRatio: 1,
            animationDuration: 1000,
            zoomWindow: {
                width: "100%",
                height: "100%"
            },
            frame: {
                padding: 10,
                opacity: 0.5,
                background: "green"
            }
        }, options);

        /**
         * The object with data about ongoing animation.
         * @type {Object}
         */
        this.animationParams = {};

        /**
         * The window through which is observed the magnifying process.
         * @type {HTMLElement}
         */
        this.zoomWindow = window.document.createElement("div");

        /**
         * The wrapper of the image element. Its main purpose is to be a container for the frame object.
         * @type {HTMLElement}
         */
        this.imgWrapper = window.document.createElement("div");

        /**
         * The shortcut for the image object.
         * @type {HTML Image Element}
         */
        this.img = this.options.image;

        /**
         * The frame with recognized data.
         * @type {HTMLElement}
         */
        this.frame = window.document.createElement("div");

        // If an image has not been loaded yet, define the onload event listener.
        if(this.img.naturalWidth === 0) {
            this.img.onload = function(){
                _this._init();
            };
        } else {
            _this._init();
        }

    };

    /**
     * Adds a px suffix to a number.
     * @param {Number} number
     * @returns {String]
     * @public
     */
    FrameZoomer.prototype.addPx = function(number){
        return number + 'px';
    };

    /**
     * Gets the natural width of the image given the zoomRatio
     * @returns {number}
     * @public
     */
    FrameZoomer.prototype.getImgNaturalHeight = function(){
        return this.img.naturalHeight * this.options.zoomRatio;
    };

    /**
     * Gets the natural height of the image given the zoomRatio
     * @returns {number}
     * @public
     */
    FrameZoomer.prototype.getImgNaturalWidth = function(){
        return this.img.naturalWidth * this.options.zoomRatio;
    };

    /**
     * Draws the frame over the image.
     * @param {Number} x - The position of the frame on the x-axis in px
     * @param {Number} y - The position of the frame on the y-axis in px
     * @param {Number} width - Width of the frame in px
     * @param {Number} height - Height of the frame in px
     * @returns {FrameZoomer}
     * @public
     */
    FrameZoomer.prototype.drawFrame = function (x, y, width, height) {
        var ratioScale = this._getImageScalingRatio();

        this.frame.style.display = "block";
        this.frame.style.left = this.addPx(ratioScale * x);
        this.frame.style.top = this.addPx(ratioScale * y);
        this.frame.style.width = this.addPx(ratioScale * width);
        this.frame.style.height = this.addPx(ratioScale * height);

        return this;
    };

    /**
     * Zoom in the frame.
     * @param {Number} x - The position of the frame on the x-axis in px
     * @param {Number} y - The position of the frame on the y-axis in px
     * @param {Number} width - Width of the frame in px
     * @param {Number} height - Height of the frame in px
     * @param {Function} [onStart] - The callback is called when animation is started
     * @param {Function} [onComplete] - The callback is called when animation is completed
     * @returns {FrameZoomer}
     * @public
     */
    FrameZoomer.prototype.zoomIn = function (x, y, width, height, onStart, onComplete) {
        var _this = this;

        this.animationParams.animationInProcess = false;
        this.animationParams.initialX = this.animationParams.offsetX = (x - this.options.frame.padding / 2) * this.options.zoomRatio;
        this.animationParams.initialY = this.animationParams.offsetY = (y - this.options.frame.padding / 2) * this.options.zoomRatio;
        this.animationParams.frameWidth = (width + this.options.frame.padding) * this.options.zoomRatio;
        this.animationParams.frameHeight = (height + this.options.frame.padding) * this.options.zoomRatio;
        this.animationParams.isStickingRight = false;
        this.animationParams.isStickingBottom = false;
        this.animationParams.stickingRightPosition = undefined;
        this.animationParams.stickingBottomPosition = undefined;
        this.animationParams.start = Date.now();
        this.animationParams.ratioProgress = undefined;
        this.animationParams.ratioWidth = undefined;

        this.hideFrame();
        this._startAnimation();

        if(typeof onStart === 'function'){
            onStart.apply(_this, [_this.animationParams]);
        }

        var step = function(timestamp) {
            _this._calculateRatios()
                ._scaleImage()
                .drawFrame(_this.animationParams.initialX, _this.animationParams.initialY, _this.animationParams.frameWidth, _this.animationParams.frameHeight);

            _this._setZoomWindowOffset('horizontal')
                ._centerZoomWindowOffset('horizontal')
                ._checkExceedingImageBoundaries('horizontal')
                ._moveZoomWindow('horizontal');

            _this._setZoomWindowOffset('vertical')
                ._centerZoomWindowOffset('vertical')
                ._checkExceedingImageBoundaries('vertical')
                ._moveZoomWindow('vertical');

            if ( (_this.animationParams.ratioProgress < 1) && (_this.img.offsetWidth <= _this.getImgNaturalWidth()) && (_this.frame.offsetWidth < _this.zoomWindow.offsetWidth) ) {
                requestAnimationFrame(step);
            } else {
                _this._stopAnimation();

                if(typeof onComplete === 'function'){
                    onComplete.apply(_this, [_this.animationParams]);
                }
            }
        };

        window.requestAnimationFrame(step);

        return this;
    };

    /**
     * Resets the module state.
     * @returns {FrameZoomer}
     * @public
     */
    FrameZoomer.prototype.zoomOut = function () {
        this.hideFrame();
        this._setInitialStyle();

        return this;
    };

    /**
     * Returns the vertical or horizontal offset of the frame relatively to the zoom window.
     * @param {String} direction - Takes 2 values: 'horizontal' or 'vertical'
     * @returns {Number}
     * @public
     */
    FrameZoomer.prototype.getFrameOffsetInsideZoomWindow =  function(direction){
        switch(direction){
            case 'horizontal':
                return parseFloat(this.frame.style.left) - (this.animationParams.isStickingRight ? this.animationParams.stickingRightPosition : this.animationParams.offsetX);
            case 'vertical':
                return parseFloat(this.frame.style.top) - (this.animationParams.isStickingBottom ? this.animationParams.stickingBottomPosition : this.animationParams.offsetY);
        }
    };

    /**
     * Returns the vertical or horizontal limit of the frame offset relatively to the zoom window. This offset is used for the vertical/horizontal centering of the frame inside of the zoom window.
     * @param {String} direction - Takes 2 values: 'horizontal' or 'vertical'
     * @public
     */
    FrameZoomer.prototype.getFrameOffsetLimitInsideZoomWindow = function(direction){
        switch(direction){
            case 'horizontal':
                return this.zoomWindow.offsetWidth/2 - this.animationParams.frameWidth/2;
            case 'vertical':
                return  this.zoomWindow.offsetHeight/2 - this.animationParams.frameHeight/2;
        }
    };

    /**
     * Returns the offset to the left of the frame relatively to the zoom window.
     * @returns {Number}
     * @public
     */
    FrameZoomer.prototype.getFrameLeftOffsetInsideZoomWindow = function(){
        return (this.animationParams.offsetX + this.zoomWindow.offsetWidth) - (parseFloat(this.frame.style.left) + this.frame.offsetWidth);
    };

    /**
     * Checks whether the rightmost/bottommost edge of the frame is visible.
     * @returns {Boolean}
     * @public
     */
    FrameZoomer.prototype.isFrameRightmostEdgeVisible = function(){
        return this.getFrameLeftOffsetInsideZoomWindow() > 0;
    };

    /**
     * Checks whether the frame exceeds the limit of the offset.
     * @param {String} direction - Takes 2 values: 'horizontal' or 'vertical'
     * @return {Boolean}
     * @public
     */
    FrameZoomer.prototype.isFrameExceedOffsetLimit = function(direction){
        switch(direction){
            case 'horizontal':
                return this.getFrameOffsetInsideZoomWindow(direction) <  this.getFrameOffsetLimitInsideZoomWindow(direction);
            case 'vertical':
                return this.getFrameOffsetInsideZoomWindow(direction) < this.getFrameOffsetLimitInsideZoomWindow(direction);
        }
    };

    /**
     * Hides the frame.
     * @returns {Boolean}
     * @public
     */
    FrameZoomer.prototype.hideFrame = function () {
        this.frame.style.display = "none";
    };

    /**
     * A pure version of jQuery's wrap with a little modification.
     * Wrap an HTMLElement around each element in an HTMLElement array.
     * @param {HTMLElement} wrapper - A wrapper DOM element.
     * @param {HTMLElement} elms - A DOM node or an array of nodes to wrap.
     * @returns {HTMLElement}
     * @public
     */
    FrameZoomer.prototype.wrap = function (wrapper, elms) {
        if (!elms.length) {
            elms = [elms];
        }

        for (var i = elms.length - 1; i >= 0; i--) {
            var child = wrapper,
                el = elms[i],
                parent = el.parentNode,
                sibling = el.nextSibling;

            child.appendChild(el);

            if(sibling) {
                parent.insertBefore(child, sibling);
            } else {
                parent.appendChild(child);
            }
        }

        return wrapper;
    };

    /**
     * Merges the contents of two objects together into the first object.
     * @param {Object} obj1
     * @param {Object} obj2
     * @returns {Object}
     * @public
     */
    FrameZoomer.prototype.extend = function (obj1, obj2) {
        for (var p in obj2) {
            try {
                obj1[p] = obj2[p].constructor === Object ? this.extend(obj1[p], obj2[p]) : obj2[p];
            } catch (e) {
                obj1[p] = obj2[p];
            }
        }

        return obj1;
    };

    /**
     * Checks whether dimensions of the original image are bigger than dimensions of the zoom window otherwise throws the Exception.
     * @return {Void}
     * @private
     */
    FrameZoomer.prototype._checkImageBoundaries = function(){
        if(this.getImgNaturalWidth() <= this.zoomWindow.offsetWidth) {
            throw new Error("The width of the original image is less than width of the zoom window. Please increase the zoomRatio value.");
        }

        if(this.getImgNaturalHeight() <= this.zoomWindow.offsetHeight) {
            throw new Error("The height of the original image is less than height of the zoom window. Please increase the zoomRatio value.");
        }
    };

    /**
     * Performs initial actions on the class initialization.
     * @returns {FrameZoomer}
     * @private
     */
    FrameZoomer.prototype._init = function(){
        this.zoomWindow.setAttribute("id", "zoomWindow");
        this.zoomWindow.style.width = typeof this.options.zoomWindow.width === 'string' ? this.options.zoomWindow.width : this.addPx(this.options.zoomWindow.width);
        this.zoomWindow.style.height = typeof this.options.zoomWindow.height === 'string' ? this.options.zoomWindow.height : this.addPx(this.options.zoomWindow.height);
        this.zoomWindow.style.overflow = "hidden";
        this.zoomWindow.style.position = "relative";

        this.imgWrapper.setAttribute("id", "wrapper");
        this.imgWrapper.style.position = "relative";

        this.img.style.width = "100%";

        this.frame.style.background = this.options.frame.background;
        this.frame.style.opacity = this.options.frame.opacity;
        this.frame.style.display = "none";
        this.frame.style.zIndex = "100";
        this.frame.style.position = "absolute";

        this.wrap(this.imgWrapper, this.img);
        this.wrap(this.zoomWindow, this.imgWrapper);
        this.imgWrapper.appendChild(this.frame);

        this._checkImageBoundaries();

        return this;
    };

    /**
     * Sets the horizontal offset of the zoom window to the right edge of the frame.
     * @returns {FrameZoomer}
     * @private
     */
    FrameZoomer.prototype._stickZoomWindowToFrameRightEdge = function(){
        this.animationParams.offsetX = this.animationParams.offsetX - this.getFrameLeftOffsetInsideZoomWindow();

        return this;
    };

    /**
     * Sets the offset of the zoom window to the limit of the frame offset thereby sticking animation to the certain point.
     * @param {String} direction - Takes 2 values: 'horizontal' or 'vertical'
     * @returns {FrameZoomer}
     * @private
     */
    FrameZoomer.prototype._stickZoomWindowToFrameOffsetLimit = function(direction){
        switch(direction){
            case 'horizontal':
                this.animationParams.offsetX = parseFloat(this.frame.style.left) - this.getFrameOffsetLimitInsideZoomWindow(direction);
                this.animationParams.offsetX = this.animationParams.offsetX > 0 ? this.animationParams.offsetX : 0;
                break;
            case 'vertical':
                this.animationParams.offsetY = parseFloat(this.frame.style.top) -  this.getFrameOffsetLimitInsideZoomWindow(direction);
                this.animationParams.offsetY = this.animationParams.offsetY > 0 ? this.animationParams.offsetY : 0;
                break;
        }

        return this;
    };

    /**
     * Sets the offset of the zoom window to the boundary of the image thereby sticking animation to the boundary of the image.
     * @param {String} direction - Takes 2 values: 'horizontal' or 'vertical'
     * @returns {FrameZoomer}
     * @private
     */
    FrameZoomer.prototype._stickZoomWindowToImageBoundary = function(direction){
        switch(direction){
            case 'horizontal':
                this.animationParams.stickingRightPosition = this.img.offsetWidth - this.zoomWindow.offsetWidth;
                break;
            case 'vertical':
                this.animationParams.stickingBottomPosition = this.img.offsetHeight - this.zoomWindow.offsetHeight;
                break;
        }

        return this;
    };

    /**
     * Sets the offset of the zoom window considering the ratio.
     * @param {String} direction - Takes 2 values: 'horizontal' or 'vertical'
     * @returns {FrameZoomer}
     * @private
     */
    FrameZoomer.prototype._setZoomWindowOffset = function(direction){
        switch(direction){
            case 'horizontal':
                this.animationParams.offsetX = this.animationParams.initialX * this.animationParams.ratioProgress;
                break;
            case 'vertical':
                this.animationParams.offsetY = this.animationParams.initialY * this.animationParams.ratioProgress;
                break;
        }

        return this;
    };

    /**
     * Centers the position of the zoom window relatively to the frame.
     * @param {String} direction - Takes 2 values: 'horizontal' or 'vertical'
     * @returns {FrameZoomer}
     * @private
     */
    FrameZoomer.prototype._centerZoomWindowOffset = function(direction){
        switch(direction){
            case 'horizontal':
                if(!this.isFrameRightmostEdgeVisible()){
                    this._stickZoomWindowToFrameRightEdge();
                } else if(this.isFrameExceedOffsetLimit(direction)){
                    this._stickZoomWindowToFrameOffsetLimit(direction);
                }
                break;
            case 'vertical':
                if(this.isFrameExceedOffsetLimit(direction)){
                    this._stickZoomWindowToFrameOffsetLimit(direction);
                }
                break;
        }

        return this;
    };

    /**
     * Checks whether the zoom window exceeds boundary of the image otherwise sticks to the appropriate boundary.
     * @param {String} direction - Takes 2 values: 'horizontal' or 'vertical'
     * @returns {FrameZoomer}
     * @private
     */
    FrameZoomer.prototype._checkExceedingImageBoundaries = function(direction){
        switch(direction){
            case 'horizontal':
                this.animationParams.isStickingRight = (this.img.offsetWidth - (this.animationParams.offsetX + this.zoomWindow.offsetWidth)) < 0;
                if(this.animationParams.isStickingRight){
                   this._stickZoomWindowToImageBoundary(direction);
                }
                break;
            case 'vertical':
                this.animationParams.isStickingBottom = (this.img.offsetHeight - (this.animationParams.offsetY + this.zoomWindow.offsetHeight)) < 0;
                if(this.animationParams.isStickingBottom){
                    this._stickZoomWindowToImageBoundary(direction);
                }
                break;
        }

        return this;
    };

    /**
     * Moves the zoom window for the current step.
     * @param {String} direction - Takes 2 values: 'horizontal' or 'vertical'
     * @returns {FrameZoomer}
     * @private
     */
    FrameZoomer.prototype._moveZoomWindow = function(direction){
        switch(direction){
            case 'horizontal':
                this.imgWrapper.style.right = this.addPx(this.animationParams.isStickingRight ? this.animationParams.stickingRightPosition : this.animationParams.offsetX);
                break;
            case 'vertical':
                this.imgWrapper.style.bottom = this.addPx(this.animationParams.isStickingBottom ? this.animationParams.stickingBottomPosition : this.animationParams.offsetY);
                break;
        }

        return this;
    };

    /**
     * Scales the image.
     * @returns {FrameZoomer}
     * @private
     */
    FrameZoomer.prototype._scaleImage = function(){
        this.imgWrapper.style.width = this.addPx(this.getImgNaturalWidth() * this.animationParams.ratioWidth + this.zoomWindow.offsetWidth);

        return this;
    };

    /**
     * Calculates ratios of progress, width and position for the current step.
     * @returns {FrameZoomer}
     * @private
     */
    FrameZoomer.prototype._calculateRatios = function(){
        var ratioProgress = (Date.now() - this.animationParams.start) / this.options.animationDuration;

        this.animationParams.ratioProgress = ratioProgress > 1 ? 1 : ratioProgress;

        this.animationParams.ratioWidth = ratioProgress - ratioProgress * this._getInitialImageScalingRatio();

        return this;
    };

    /**
     * Checks whether animation in the process.
     * @returns {Boolean}
     * @public
     */
    FrameZoomer.prototype.isAnimationInProcess = function () {
        return this.animationParams.animationInProcess;
    };

    /**
     * Sets the animation state to true.
     * @returns {Boolean}
     * @private
     */
    FrameZoomer.prototype._startAnimation = function () {
        this.animationParams.animationInProcess = true;
    };

    /**
     * Sets the animation state to false.
     * @returns {Boolean}
     * @private
     */
    FrameZoomer.prototype._stopAnimation = function () {
        this.animationParams.animationInProcess = false;
    };

    /**
     * Gets the scaling ratio of the image.
     * @returns {Number}
     * @private
     */
    FrameZoomer.prototype._getImageScalingRatio = function(){
        return parseFloat(this.img.offsetWidth) / parseFloat(this.getImgNaturalWidth());
    };

    /**
     * Gets the initial scaling ratio of the image.
     * @returns {Number}
     * @private
     */
    FrameZoomer.prototype._getInitialImageScalingRatio = function(){
        return parseFloat(this.zoomWindow.offsetWidth) / parseFloat(this.getImgNaturalWidth());
    };

    /**
     * Sets initial styles for the FrameZoomer instance.
     * @returns {FrameZoomer}
     * @private
     */
    FrameZoomer.prototype._setInitialStyle = function () {
        this._stopAnimation();

        this.imgWrapper.style.width = "100%";
        this.imgWrapper.style.right = 0;
        this.imgWrapper.style.bottom = 0;

        this.frame.style.width = 0;
        this.frame.style.height = 0;
        this.frame.style.top = 0;
        this.frame.style.left = 0;

        return this;
    };

    // AMD
    if (typeof define === "function" && define.amd) {
        define(function () {
            return FrameZoomer;
        });
    } else {
        window.FrameZoomer = FrameZoomer;
    }

})(window);