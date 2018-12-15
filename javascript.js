//Request Animation frame loop.
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

//Start of game code
var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    width = 1280,
    height = 720,
    player = {
        x : width / 2,
        y : height - 25,
        width : 25,
        height : 25,
        speed : 3,
        velX : 0,
        velY : 0,
        jumping : false
    },
    keys = [],
    friction = 0.8,
    gravity = 0.3;

var boxes = []

//Box dimmensions (Edges of screen)
boxes.push({
    x: 0,
    y: 0,
    width: 10,
    height: height
});

boxes.push({
    x: 0,
    y: height - 10,
    width: width,
    height: 50
});

boxes.push({
    x: width - 10,
    y: 0,
    width: 50,
    height: height
});

boxes.push({
    x: 0,
    y: 0,
    width: width,
    height: height - 710
});

//Canavas size
canvas.width = width;
canvas.height = height;

function update() {
    // check keys
    if (keys[38] || keys[87] || keys[32]) {
        // up arrow
        if (!player.jumping) {
            player.jumping = true;
            player.velY = -player.speed*2;
        }
    }
    if (keys[39] || keys[68]) {
        // right arrow
        if (player.velX < player.speed) {                         
            player.velX++;                  
        }          
    }          
    if (keys[37] || keys[65]){                 
        // left arrow                  
        if (player.velX > -player.speed) {
            player.velX--;
        }
    }

    player.x += player.velX;
    player.y += player.velY;
    if (player.x >= width-player.width) {
        player.x = width-player.width;
    } else if (player.x <= 0) {
        player.x = 0;
    }
    if(player.y >= height-player.height){
        player.y = height - player.height;
        player.jumping = false;
    }
    player.velX *= friction;
    player.velY += gravity;

    ctx.clearRect(0,0,width,height);
    //Draw out player
    ctx.fillStyle = "#FC5130";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    //Draw boxes
    ctx.fillStyle = "#050401";
    ctx.beginPath();
    for (var i = 0; i < boxes.length; i++) {
        ctx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
    }
    ctx.fill();
    //Run through update loop again
    requestAnimationFrame(update);
}

//Collision checking
function colCheck() {
    //get the vectors to check against
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2 )),
        vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.width / 2 )),
        //Add the half widths/heights of the objects
        hWidths = (shapeA.width / 2) + (shapeB.width / 2),
        hHeights = (shapeA.heights / 2) + (shapeB.width / 2),
        colDir = null;

    //If the x/y vector are less than half the width/height, they must be inside the object, causing a collision.
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) { // figures out on which side we are colliding (top, bottom, left, or right)
        if (vY > 0) {
            colDir = "t";
            shapeA.y += oY;
        } else {
            colDir = "b";
            shapeA.y -= oY;
        }
    } else {
        if (vX > 0) {
            colDir = "l";
            shapeA.x += oX;
        } else {
            colDir = "r";
            shapeA.x -= oX;
        }
    }
    return colDir;
}

//Event listeners
window.addEventListener("load", function(){
    update();
  });

  document.body.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
});
 
document.body.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
});

//Prevents the window scrolling down when space is pressed.
window.addEventListener('keydown', function(e) {
    if(e.keyCode == 32 && e.target == document.body) {
      e.preventDefault();
    }
  });