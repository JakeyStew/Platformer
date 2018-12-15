//Request Animation frame loop.
/*(function() {
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
}());*/

(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

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
        jumping : false,
        grounded: false
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

//Box dimmensions (Platforms)
boxes.push({
    x: 120,
    y: 650,
    width: 500,
    height: 10
});
boxes.push({
    x: 250,
    y: 600,
    width: 250,
    height: 10
});
boxes.push({
    x: 120,
    y: 450,
    width: 10,
    height: 200
});
boxes.push({
    x: 500,
    y: 550,
    width: 300,
    height: 10
});

//Canavas size
canvas.width = width;
canvas.height = height;

function update() {
    // check keys
    if (keys[38] || keys[87] || keys[32]) {
        // up arrow or space
        if (!player.jumping && player.grounded) {
            player.jumping = true;
            player.grounded = false; // We're not on the ground anymore!!
            player.velY = -player.speed * 2;
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
    player.velX *= friction;
    player.velY += gravity;

    ctx.clearRect(0,0,width,height);

    //Draw out player
    ctx.fillStyle = "#FC5130";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    //Draw boxes
    ctx.fillStyle = "#050401";
    ctx.beginPath();

    player.grounded = false;
    //Draw the box loop
    for (var i = 0; i < boxes.length; i++) {
        ctx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
        var dir = colCheck(player, boxes[i]);

        if (dir === "l" || dir === "r") {
            player.velX = 0;
            player.jumping = false;
        } else if (dir === "b") {
            player.grounded = true;
            player.jumping = false;
        } else if (dir === "t") {
            player.velY *= -1;
        }
    }

    if(player.grounded){
        player.velY = 0;
    }

    ctx.fill();
    //Run through update loop again
    requestAnimationFrame(update);
}

//Collision checking
function colCheck(shapeA, shapeB) {
    //get the vectors to check against
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2 )),
        vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2 )),
        //Add the half widths/heights of the objects
        hWidths = (shapeA.width / 2) + (shapeB.width / 2),
        hHeights = (shapeA.height / 2) + (shapeB.height / 2),
        colDir = null;

    //If the x/y vector are less than half the width/height, they must be inside the object, causing a collision.
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) { // figures out on which side we are colliding (top, bottom, left, or right)
        var oX = hWidths - Math.abs(vX),
            oY = hHeights - Math.abs(vY);
        if (oX >= oY) {
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
    }
    return colDir;
}

//Event listeners
document.body.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
});
 
document.body.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
});

window.addEventListener("load", function(){
    update();
});
//Prevents the window scrolling down when space is pressed.
window.addEventListener('keydown', function(e) {
    if(e.keyCode == 32 && e.target == document.body) {
      e.preventDefault();
    }
  });