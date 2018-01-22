// Keep track of our socket connection
var socket;
var squares = [];
var nameInput;
var instructionsDiv;
var canvas;
var connectsent = false;

setInterval(function() {
    if (connectsent) {
        sendblock(b.x, b.y, b.size, b.xspeed, b.yspeed, b.uuid, b.name);
    }
}, 5000);
function windowResized(){
    resizeCanvas(Math.floor(windowWidth*.98),Math.floor(windowHeight*.94));
}
function setup() {
    frameRate(.01);
    instructionsDiv = createDiv('Click and drag to move or use the mouse wheel. Type your name and then hit enter.');
    nameInput = createInput();
    nameInput.parent('input');

    instructionsDiv.parent('input');
    nameInput.changed(function newtext() {
        b.name = nameInput.value();
        sendblock(b.x, b.y, b.size, b.xspeed, b.yspeed, b.uuid, b.name);
        frameRate(60);
        removeElements();
        //canvas = createCanvas(640, 640);
        canvas = createCanvas(Math.floor(windowWidth*.98),Math.floor(windowHeight*.94));
        //canvas = createCanvas(innerWidth,innerHeight);
        canvas.parent('game');

        sendconnect(b.x, b.y, b.size, b.xspeed, b.yspeed, b.uuid, b.name);
        nameDiv = createDiv("Name: " + b.name);
    });
    b = new block();
    socket = io.connect();
    socket.on('block',
        // When we receive data
        function(data) {
            found = false;
            index = null;

            if (squares.length === 0) {
                squares.push(new fblock());
                squares[0].x = data.x;
                squares[0].y = data.y;
                squares[0].size = data.s;
                squares[0].xspeed = data.xs;
                squares[0].yspeed = data.ys;
                squares[0].uuid = data.u;
                squares[0].name = data.n;
            } else {
                for (var i = squares.length - 1; i >= 0; i--) {
                    if (squares[i].uuid == data.u) {
                        squares[i].x = data.x;
                        squares[i].y = data.y;
                        squares[i].size = data.s;
                        squares[i].xspeed = data.xs;
                        squares[i].yspeed = data.ys;
                        squares[i].name = data.n;
                        found = true;
                        index = i;
                    }
                }
            }
            if (found === false) {
                squares.push(new fblock());
                squares[squares.length - 1].x = data.x;
                squares[squares.length - 1].y = data.y;
                squares[squares.length - 1].size = data.s;
                squares[squares.length - 1].xspeed = data.xs;
                squares[squares.length - 1].yspeed = data.ys;
                squares[squares.length - 1].uuid = data.u;
                squares[squares.length - 1].name = data.n;
            }
        }
    );
    socket.on('new', function(data) {
        squares.push(new fblock());
        squares[squares.length - 1].x = data.x;
        squares[squares.length - 1].y = data.y;
        squares[squares.length - 1].size = data.s;
        squares[squares.length - 1].xspeed = data.xs;
        squares[squares.length - 1].yspeed = data.ys;
        squares[squares.length - 1].uuid = data.u;
        squares[squares.length - 1].name = data.n;
        sendblock(b.x, b.y, b.size, b.xspeed, b.yspeed, b.uuid, b.name);
    });
    socket.on('hit', function(data) {
        if (b.uuid === data.u) {
            b.xspeed *= -1;
            b.yspeed *= -1;
            sendblock(b.x, b.y, b.size, b.xspeed, b.yspeed, b.uuid, b.name);
        }
    });
    socket.on('exit', function() {
        squares = [];
        sendblock(b.x, b.y, b.size, b.xspeed, b.yspeed, b.uuid, b.name);
    });
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function draw() {
    background(51);

    for (var i = squares.length - 1; i >= 0; i--) {
        hit = collideRectRect(b.x, b.y, b.size, b.size, squares[i].x, squares[i].y, squares[i].size, squares[i].size)
        if (hit) {
            b.xspeed *= -1;
            b.yspeed *= -1;
            sendhit(squares[i].uuid);
            }
        squares[i].update();
        squares[i].show();
    }
    b.update();
    b.show();

}

function fblock() {
    this.x = width / 2;
    this.y = height / 2;
    this.size = (width * .01);
    this.xspeed = 0;
    this.yspeed = -.1;
    this.stroke = color(random(0, 255), random(0, 255), random(0, 255));
    this.color = color(random(0, 255), random(0, 255), random(0, 255));
    this.uuid = null;
    this.name = '';
    this.update = function() {
        if (this.x === 0 || this.x === width - this.size) {
            this.xspeed = -1 * this.xspeed;
            this.xspeed = this.xspeed * .95;
            this.x = this.x - this.xspeed;
        } else {
            this.x = this.x - this.xspeed;
        }
        if (this.y === 0 || this.y === height - this.size) {
            this.yspeed = -1 * this.yspeed;
            this.yspeed = this.yspeed * .95;
            this.y = this.y - this.yspeed;
        } else {
            this.y = this.y - this.yspeed;
        }
        this.x = constrain(this.x, 0, width - this.size);
        this.y = constrain(this.y, 0, height - this.size);
    }
    this.show = function() {
        fill(this.color);
        stroke(this.stroke);
        textSize(32);
        text(this.name, Math.floor(this.x), Math.floor(this.y));
        rect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
    }
}

function block() {
    this.x = width / 2;
    this.y = height / 2;
    this.size = (width * random(0.01, .09));
    this.xspeed = random(-2.3, 2.3);
    this.yspeed = random(-2.3, 2.3);
    this.stroke = color(random(0, 255), random(0, 255), random(0, 255));
    this.color = color(random(0, 255), random(0, 255), random(0, 255));
    this.uuid = guid();
    this.name = nameInput.value();
    this.update = function() {
        if (this.x === 0 || this.x === width - this.size) {
            this.xspeed = -1 * this.xspeed;
            this.xspeed = this.xspeed * .95;
            this.x = this.x - this.xspeed;
        } else {
            this.x = this.x - this.xspeed;
        }
        if (this.y === 0 || this.y === height - this.size) {
            this.yspeed = -1 * this.yspeed;
            this.yspeed = this.yspeed * .95;
            this.y = this.y - this.yspeed;
        } else {
            this.y = this.y - this.yspeed;
        }
        this.x = constrain(this.x, 0, width - this.size);
        this.y = constrain(this.y, 0, height - this.size);

    }
    this.show = function() {
        //push();
        fill(this.color);
        stroke(this.stroke);
        textSize(32);
        //fill('yellow');
        text(this.name, Math.floor(this.x), Math.floor(this.y));
        rect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
        //pop();
    }
}

function mouseWheel(event) {
    if (connectsent) {
        ////print(event.delta);
        //move the square according to the vertical scroll amount
        b.xspeed += event.delta;
        b.yspeed += event.delta;
        //uncomment to block page scrolling
        sendblock(b.x, b.y, b.size, b.xspeed, b.yspeed, b.uuid, b.name);
        return false;
    }
}

function touchMoved() {
    if (connectsent) {
        strokeWeight(2);
        stroke('red');
        b.xspeed = b.xspeed + (((mouseX - b.x) / 2) * .01);
        b.yspeed = b.yspeed + (((mouseY - b.y) / 2) * .01);
        //line(b.x + (b.size / 2), b.y + (b.size / 2), mouseX, mouseY);
        sendblock(b.x, b.y, b.size, b.xspeed, b.yspeed, b.uuid, b.name);
        return false;
    }
}

// Function for sending to the socket
function sendblock(x, y, size, xspeed, yspeed, uuid, name) {
    // We are sending!
    if (connectsent) {
        //console.log("sendblock: " + x + " " + y + " " + size + " " + xspeed + " " + yspeed + " " + uuid);

        // Make a little object with  and y
        var data = {
            x: x,
            xs: xspeed,
            y: y,
            ys: yspeed,
            s: size,
            u: uuid,
            n: name
        };

        // Send that object to the socket
        socket.emit('block', data);
    }
}

function sendconnect(x, y, size, xspeed, yspeed, uuid, name) {
    connectsent = true;
    var data = {
        x: x,
        xs: xspeed,
        y: y,
        ys: yspeed,
        s: size,
        u: uuid,
        n: name
    };
    socket.emit('new', data);
}

function sendhit(huuid) {
    var data = {
        u: huuid
    };
    socket.emit('hit', data);
}