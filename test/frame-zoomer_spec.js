/* jshint globalstrict: true */
/* jshint expr: true */
/* global publishExternalAPI: false, createInjector: false */
'use strict';

describe("Image-Zoomer tests", function() {
    var image     = new Image(),
        parentDiv = document.createElement("div"),
        frameZoomer,
        animationParams;


    beforeEach(function(done){
        image.src = 'http://dmgts.github.io/frame-zoomer/business-card.jpg';
        image.onload = function(){
            frameZoomer = new FrameZoomer({
                image: image,
                zoomRatio: 1,
                animationDuration: 1200,
                zoomWindow: {
                    height: 350,
                    width: 550
                }
            });

            frameZoomer.zoomIn(143, 90, 418, 94,
                function(){},
                function(params){
                    animationParams = params;
                    done();
                }
            );

        };

        document.body.appendChild(image);
    });

    it('should set the progress ratio to 1', function(){
        expect(animationParams.ratioProgress).toBe(1);
    });

});
