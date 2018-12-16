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
        x : width / 20,
        y : height - 25,
        width : 25,
        height : 25,
        speed : 3,
        velX : 0,
        velY : 0,
        jumping : false,
        grounded : false
    },
    keys = [],
    friction = 0.8,
    gravity = 0.3,
    score = 0;
    lives = 3;

var boxes = []
var coins = []
var lava = []

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
    x: 10,
    y: 685,
    width: 200,
    height: 25
});
boxes.push({
    x: 270,
    y: 630,
    width: 100,
    height: 25
});
boxes.push({
    x: 450,
    y: 570,
    width: 100,
    height: 25
});
boxes.push({
    x: 670,
    y: 570,
    width: 50,
    height: 150
});
boxes.push({
    x: 830,
    y: 530,
    width: 100,
    height: 25
});
boxes.push({
    x: 1030,
    y: 480,
    width: 100,
    height: 25
});
boxes.push({
    x: 1105,
    y: 330,
    width: 25,
    height: 150
});

//coins dimmensions
coins.push({
    x: 20,
    y: 667,
    width: 10,
    height: 10,
    status: 1 //Status for draw (1)/no draw (0)
});
coins.push({
    x: 315,
    y: 610,
    width: 10,
    height: 10,
    status: 1
});
coins.push({
    x: 690,
    y: 550,
    width: 10,
    height: 10,
    status: 1
});
coins.push({
    x: 1065,
    y: 460,
    width: 10,
    height: 10,
    status: 1
});

//Lava dimmensions
lava.push({
    x: 210,
    y: 690,
    width: 1070,
    height: 25
});

//Canavas size
canvas.width = width;
canvas.height = height;

function drawScore() {
    ctx.font = "16px Montserrat";
    ctx.fillStyle = "#FC5130";
    ctx.fillText("Score: "+score, 18, 30);
}

function drawLives() {
    ctx.font = "16px Montserrat";
    ctx.fillStyle = "#FC5130";
    ctx.fillText("Lives: "+lives, 18, 50);
}

function drawLava() {
    for(var i = 0; i < lava.length; i++) {
        ctx.beginPath();
        ctx.rect(lava[i].x, lava[i].y, lava[i].width, lava[i].height);
        ctx.fillStyle = "#B22222";
        ctx.fill();
        ctx.closePath();

        //Collision Check (If hit lava, lose a life. If no lives restart game.)
        if (colCheck(player, lava[i]) !== null) {
            lives--;
            if(lives == 0) {
                alert("GAME OVER");
                document.location.reload();
            } else {
                player.x = width / 20,
                player.y = height - 25
            }
        }
    }
}

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

    //Draw score + lives
    drawScore();
    drawLives();
    //Draw lava
    drawLava();

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

    //Draw coins
    ctx.fillStyle = "#FFDF00";
    ctx.beginPath();
    for (var j = 0; j < coins.length; j++) {
        if (coins[j].status == 1) {
            ctx.save();
            var cx = coins[j].x + 0.5 * coins[j].width,   // x of shape center
            cy = coins[j].y + 0.5 * coins[j].height; //y of shape center
            ctx.translate(cx, cy);  //translate to center of shape
            ctx.rotate( (Math.PI / 180) * 45);//rotate 25 degrees.
            if(coins[j].effect  === 'tele'){
                ctx.rotate( (Math.PI / 180) * coins[j].rotate);//rotate 25 degrees.
                coins[j].rotate = (Math.PI / 180) * coins[j].rotate;
            }
            ctx.translate(-cx, -cy);            //translate center back to 0,0
            ctx.fillStyle = coins[j].color;
            ctx.fillRect(coins[j].x, coins[j].y, coins[j].width, coins[j].height);
            ctx.restore();

            //Check collision
            if (colCheck(player, coins[j]) !== null) {
                //If coin hit
                if (coins[j].stay!==true)
                {
                    //Set status of brick to 0 (dont draw)
                    coins[j].status = 0;
                    //Increase score
                    score++;
                }
            }
        }
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
                colDir = "t"; //collided with Top
                shapeA.y += oY;
            } else {
                colDir = "b"; //collided with Bottom
                shapeA.y -= oY;
            }
        } else {
            if (vX > 0) {
                colDir = "l"; //collided with Left
                shapeA.x += oX;
            } else {
                colDir = "r"; //collided with Right
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