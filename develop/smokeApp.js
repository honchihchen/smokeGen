/*
    author: hon-chih.chen
*/
// Paul Irish Shim
window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };
})();

var biglaker = biglaker || {};

biglaker.smokeApp = (function() {
    
    var TOTAL = 80,
        IMG = 'images/smoke.png',
        IMG_DIM = 64,
        counter = 0,
        smokeList = [],
        image = new Image(),
        lastTick = 0,
        canvas2d,
        context,
        emitter,
        width,
        height,
        smoke,
        loc,

    getProperty = function (style, prop) {
        var val = parseInt(style.getPropertyValue(prop), 10);
        return val | 0;
    },

    initialize = function () {
        canvas2d = document.querySelector('.canvas2d');
        context = canvas2d.getContext('2d');
        emitter = document.querySelector('.emitter');

        var cstyle = window.getComputedStyle(canvas2d),
            bstyle = window.getComputedStyle(emitter),
            locX,
            locY;
           
        if (!canvas2d || !canvas2d.getContext) {
            return;
        }

        width = getProperty(cstyle, 'width');
        height = getProperty(cstyle, 'height');

        locX = getProperty(bstyle, 'left') - (((getProperty(bstyle, 'width') / 3) + 0.5) | 0 );
        locY = getProperty(bstyle, 'top') - getProperty(bstyle, 'height');

        loc = {
            x: locX,
            y: locY
        }
        image.src = IMG;
        image.width = IMG_DIM;
        image.height = IMG_DIM;
        
        generate();
    },

    calcFPS = function () {
        var now = (new Date()),
            fps = 1000 / (now - lastTick);
        lastTick = now;

        return fps;
    },

    showFPS = function () {
        context.fillStyle = '#393';
        context.fillText(calcFPS().toFixed() + ' fps', 60, 60);
    },
    
    generate = function () { 
        if (counter < TOTAL ) {
            smoke = biglaker.smokeGen(image, context, loc);
            smokeList.push(smoke);
            counter++;
        } 
        render();
        requestAnimFrame(generate);
    },

    render = function () { 
        context.clearRect(0, 0, width, height);
        showFPS();
        var i;   
        for ( i = 0; i < smokeList.length; i++ ) {
            smokeList[i].redraw(); 
        }
    };
      
    return {
        initialize : initialize
    }
})();

biglaker.smokeGen = function (img, ctx, location) {

    var LIFE_SPAN = 300, // distance
        half,
        context = ctx,
        bcontext,
        buffer,
        image = img,
        location = location,
        velocity,
        direction,
        color,
        dim,
        alpha, 
        loc,
        rotation,
        angle,

    setCol = function () {
        var rnd,
            r,
            g,
            b;

        rnd = Math.ceil(Math.random() * 15);
        r = (rnd + 100 ) & 0xFF;
        g = (rnd + 200 ) & 0xFF;
        b = (rnd + 220 ) & 0xFF;

        color = "#" + ((r << 16) + (g << 8) + b).toString(16);
    },

    resetTransform = function () { 
        context.setTransform(1, 0, 0, 1, 0, 0);
    },

    reset = function () {  
        loc = {
            x: location.x, 
            y: location.y
        };
        alpha = 0.8;  
        velocity = Math.random() * 5 + 3; 
        direction = [-1, 0, 1][Math.random() * 3 | 0];
        angle = ((Math.random() * 10 + 0.5) | 0) * direction;
        rotation = 0;
            
        setCol();
    },

    render = function () {   
        // fill offscreen buffer with the tint color                  
        bcontext.fillStyle = color;
        bcontext.fillRect(0, 0, image.width, image.height);
        bcontext.globalCompositeOperation = "destination-atop";                    
        half = {
            width: image.width / 2 | 0,
            height: image.height / 2 | 0
        };
        bcontext.translate(half.width, half.height); // to get it in the origin 
        bcontext.rotate(angle * Math.PI / 180); //rotate in origin  
        bcontext.translate(-half.width, -half.height); //put it back   
          
        bcontext.globalAlpha = alpha;  
        bcontext.drawImage(image, 0, 0);

        context.translate(loc.x, loc.y);
        context.drawImage(buffer, 0, 0);
    
        resetTransform();
    },

    transform = function () {
        if (location.y - loc.y < LIFE_SPAN ) {
            loc.y -= (velocity | 0 );
            loc.x += direction * 0.5;
            rotation += angle;
            if (alpha > 0 ) {
                alpha -= 0.02;
            } else {
                alpha = 0;
            }
        } else {
            reset();
        }  
    },

    initialize = function () { 
        buffer = document.createElement('canvas');
        bcontext = buffer.getContext('2d');
        buffer.width = image.width;
        buffer.height = image.height;  
     
        reset();
    };

    initialize();
    // return privileged functions
    return {
        redraw: function() {
            transform();
            render();
        }    
    };
};             
window.addEventListener("load", biglaker.smokeApp.initialize, false); 