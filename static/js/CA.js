/**
 * Forked from here:
 * https://github.com/skeeto/webgl-game-of-life/
 */

/**
 * Cellular automata simulation and display.
 * @param {HTMLCanvasElement} canvas Render target
 * @param {fragPath} filepath for the fragment shader
 * @param {number} [scale] Size of each cell in pixels (power of 2)
 */

function CA(canvas, fragPath, scale) {
    var igloo = this.igloo = new Igloo(canvas);
    var gl = igloo.gl;
    if (gl == null) {
        alert('Could not initialize WebGL!');
        throw new Error('No WebGL');
    }
    scale = this.scale = scale || 1;
    var w = canvas.width, h = canvas.height;
    this.fragPath = fragPath;
    this.viewsize = new Float32Array([w, h]);
    this.statesize = new Float32Array([w / scale, h / scale]);
    this.timer = null;
    this.lasttick = CA.now();
    this.fps = 0;
    this.time = 0.0;
    this.dt = 0.0001;
    gl.disable(gl.DEPTH_TEST);
    this.programs = {
        copy: igloo.program('/static/misc/gol/quad.vert', '/static/misc/gol/copy.frag'),
        gol:  igloo.program('/static/misc/gol/quad.vert', fragPath)
    };
    this.buffers = {
        quad: igloo.array(Igloo.QUAD2)
    };
    this.textures = {
        front: igloo.texture(null, gl.RGBA, gl.REPEAT, gl.NEAREST)
            .blank(this.statesize[0], this.statesize[1]),
        back: igloo.texture(null, gl.RGBA, gl.REPEAT, gl.NEAREST)
            .blank(this.statesize[0], this.statesize[1])
    };
    this.framebuffers = {
        step: igloo.framebuffer()
    };
    this.initialize();
}

/**
 * @returns {number} The epoch in integer seconds
 */
CA.now = function() {
    return Math.floor(Date.now() / 1000);
};

/**
 * Set the entire simulation state at once.
 * @param {Object} state Boolean array-like
 * @returns {CA} this
 */
CA.prototype.set = function(state) {
    var gl = this.igloo.gl;
    var rgba = new Uint8Array(this.statesize[0] * this.statesize[1] * 4);
    for (var i = 0; i < state.length; i+=4) {
        //var ii = i * 4;
        rgba[i + 0] = state[i + 0];
        rgba[i + 1] = state[i + 1];
        rgba[i + 2] = state[i + 2];
        rgba[i + 3] = state[i + 3];
    }
    this.textures.front.subset(rgba, 0, 0, this.statesize[0], this.statesize[1]);
    return this;
};

/**
 * Fill the entire state with initial values.
 * @returns {CA} this
 */
CA.prototype.initialize = function() {
    var gl = this.igloo.gl
    var size = this.statesize[0] * this.statesize[1] * 4;
    var rand = new Uint8Array(size);
	if (this.fragPath == '/static/misc/gol/gol.frag') {
	    for (var i = 0; i < size; i+=4) {
            var r = Math.random();
            if (r < 0.33) {
                rand[i+0] = 255;
                rand[i+1] = 0;
                rand[i+2] = 0;
                rand[i+3] = 255;
            } else {
                rand[i+0] = 255;
                rand[i+1] = 255;
                rand[i+2] = 255;
                rand[i+3] = 255;                
            }
        }
	} else if (this.fragPath == '/static/misc/fgw.frag' ) {
	    for (var i = 0; i < size; i+=4) {
	   		var r = Math.random();
	        if (r < 0.33) {
	        	rand[i+0] = 255;
			    rand[i+1] = 0;
			    rand[i+2] = 0;
			    rand[i+3] = 100;
	        } else if (r < 0.66) {
	        	rand[i+0] = 0;
			    rand[i+1] = 255;
			    rand[i+2] = 0;
			    rand[i+3] = 100;
	        } else {
	        	rand[i+0] = 0;
			    rand[i+1] = 0;
			    rand[i+2] = 255;
			    rand[i+3] = 100;	        	
	        }
	    }
	} else if (this.fragPath == '/static/misc/fgwstoc.frag') {
	    for (var i = 0; i < size; i+=4) {
            var r = Math.random();
            if (r < 0.33) {
                rand[i+0] = 255;
                rand[i+1] = 0;
                rand[i+2] = 0;
                rand[i+3] = 255;
            } else if (r < 0.66) {
                rand[i+0] = 0;
                rand[i+1] = 255;
                rand[i+2] = 0;
                rand[i+3] = 255;
            } else {
                rand[i+0] = 0;
                rand[i+1] = 0;
                rand[i+2] = 255;
                rand[i+3] = 255;                
            }
	    }
	} else if (this.fragPath == '/static/misc/rgb.frag') {
        for (var i = 0; i < size; i+=4) {
            var r = Math.random();
            if (r < 0.4) {
                rand[i+0] = 255;
                rand[i+1] = 0;
                rand[i+2] = 0;
                rand[i+3] = 255;
            } else if (r < 0.8) {
                rand[i+0] = 0;
                rand[i+1] = 255;
                rand[i+2] = 0;
                rand[i+3] = 255;
            } else {
                rand[i+0] = 255;
                rand[i+1] = 255;
                rand[i+2] = 255;
                rand[i+3] = 255;                
            }
        }
    } else if (this.fragPath == '/static/misc/cca.frag') {
        for (var i = 0; i < size; i+=4) {
            var r = Math.random();
            for (var i = 0; i < size; i+=4) {
                var r = Math.random();
                if (r < 0.33) {
                    rand[i+0] = 255;
                    rand[i+1] = 0;
                    rand[i+2] = 0;
                    rand[i+3] = 255;
                } else if (r < 0.66) {
                    rand[i+0] = 0;
                    rand[i+1] = 255;
                    rand[i+2] = 0;
                    rand[i+3] = 255;
                } else if (r < 0.8) {
                    rand[i+0] = 0;
                    rand[i+1] = 0;
                    rand[i+2] = 255;
                    rand[i+3] = 255;                
                } else {
                    rand[i+0] = 0;
                    rand[i+1] = 0;
                    rand[i+2] = 0;
                    rand[i+3] = 255;            
                }
            }
        }
    }
    this.set(rand);
    return this;
}

/**
 * Clear the simulation state to empty.
 * @returns {CA} this
 */
CA.prototype.setEmpty = function() {
    this.set(new Uint8Array(this.statesize[0] * this.statesize[1]));
    return this;
};

/**
 * Swap the texture buffers.
 * @returns {CA} this
 */
CA.prototype.swap = function() {
    var tmp = this.textures.front;
    this.textures.front = this.textures.back;
    this.textures.back = tmp;
    return this;
};

/**
 * Step the Game of Life state on the GPU without rendering anything.
 * @returns {CA} this
 */
CA.prototype.step = function() {
    if (CA.now() != this.lasttick) {
        $('.fps').text(this.fps + ' FPS');
        this.lasttick = CA.now();
        this.fps = 0;
    } else {
        this.fps++;
    }
    var gl = this.igloo.gl;
    this.framebuffers.step.attach(this.textures.back);
    this.textures.front.bind(0);
    gl.viewport(0, 0, this.statesize[0], this.statesize[1]);
    this.programs.gol.use()
        .attrib('quad', this.buffers.quad, 2)
        .uniformi('state', 0)
        .uniform('u_time', this.time)
        .uniform('scale', this.statesize)
        .draw(gl.TRIANGLE_STRIP, 4);
    this.swap();
    return this;
};

/**
 * Render the Game of Life state stored on the GPU.
 * @returns {CA} this
 */
CA.prototype.draw = function() {
    var gl = this.igloo.gl;
    this.igloo.defaultFramebuffer.bind();
    this.textures.front.bind(0);
    gl.viewport(0, 0, this.viewsize[0], this.viewsize[1]);
    this.programs.copy.use()
        .attrib('quad', this.buffers.quad, 2)
        .uniformi('state', 0)
        .uniform('u_time', this.time)
        .uniform('scale', this.viewsize)
        .draw(gl.TRIANGLE_STRIP, 4);
    this.time += this.dt;
    return this;
};

/**
 * Set the state at a specific position.
 * @param {number} x
 * @param {number} y
 * @param {boolean} state True/false for live/dead
 * @returns {CA} this
 */
CA.prototype.poke = function(x, y, state) {
    this.textures.front.subset([255, 0, 0, 255], x, y, 1, 1);
    return this;    
};

/**
 * @returns {Object} Boolean array-like of the simulation state
 */
CA.prototype.get = function() {
    var gl = this.igloo.gl, w = this.statesize[0], h = this.statesize[1];
    this.framebuffers.step.attach(this.textures.front);
    var rgba = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
    var state = new Uint8Array(w * h);
    for (var i = 0; i < w * h; i++) {
        state[i] = rgba[i * 4] > 128 ? 1 : 0;
    }
    return state;
};

/**
 * Run the simulation automatically on a timer.
 * @returns {CA} this
 */
CA.prototype.start = function() {
    if (this.timer == null) {
		var ca = this;
        this.timer = setInterval(function(){
            ca.step();
            ca.draw();
        }, 50);
    }
    return this;
};

/**
 * Find simulation coordinates for event.
 * This is a workaround for Firefox bug #69787 and jQuery bug #8523.
 * @returns {Array} target-relative offset
 */
CA.prototype.eventCoord = function(event) {
    var $target = $(event.target),
        offset = $target.offset(),
        border = 1,
        x = event.pageX - offset.left - border,
        y = $target.height() - (event.pageY - offset.top - border);
    return [Math.floor(x / this.scale), Math.floor(y / this.scale)];
};

/**
 * Manages the user interface for a simulation.
 */
function Controller(gol) {
    this.gol = gol;
    var _this = this,
        $canvas = $(gol.igloo.canvas);
    this.drag = null;
    $canvas.on('mousedown', function(event) {
        _this.drag = event.which;
        var pos = gol.eventCoord(event);
        gol.poke(pos[0], pos[1], _this.drag == 1);
        gol.draw();
    });
    $canvas.on('mouseup', function(event) {
        _this.drag = null;
    });
    $canvas.on('mousemove', function(event) {
        if (_this.drag) {
            var pos = gol.eventCoord(event);
            gol.poke(pos[0], pos[1], _this.drag == 1);
            gol.draw();
        }
    });
}

$(document).ready(function() {

    var $canvas = $('#life');
    var gol = new CA($canvas[0], '/static/misc/gol/gol.frag', 2)
    gol.draw()
    gol.start();
    var controller = new Controller(gol);   

    var $fgwCanvas = $('#fgw');
    var fgw = new CA($fgwCanvas[0], '/static/misc/fgw.frag', 1)
    fgw.draw()
    fgw.start();
    var fgwController = new Controller(fgw);

    var $fgwstocCanvas = $('#fgwstoc');
    var fgwstoc = new CA($fgwstocCanvas[0], '/static/misc/fgwstoc.frag')
    fgwstoc.draw()
    fgwstoc.start();
    var fgwstocController = new Controller(fgwstoc);
    var $rgbCanvas = $('#rgb');

    var rgb = new CA($rgbCanvas[0], '/static/misc/rgb.frag', 2)
    rgb.draw()
    rgb.start();
    var rgbController = new Controller(rgb);

    var $ccaCanvas = $('#cca');
    var cca = new CA($ccaCanvas[0], '/static/misc/cca.frag', 1)
    cca.draw()
    cca.start();
    var ccaController = new Controller(cca);
    
});

/* Don't scroll on spacebar. */
$(window).on('keydown', function(event) {
    return !(event.keyCode === 32);
});