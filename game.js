window.onload = function() {
  // Start crafty
  var velocityY = 2;
  var foodPerLine = 2;
  var gameWidth = 1000, gameHeight = 700;
  var food, randomXF, imageString;
  var assetsObj = {
    "images": ["images/player.png", "images/brickBlock.png", "images/1.png", "images/2.png", "images/3.png", "images/4.png", "images/5.png", "images/6.png"]
  };
  Crafty.init(gameWidth, gameHeight, document.getElementById('game'));

  function createPlayer(){
  	Crafty.c('CustomControls', {
    __move: {left: false, right: false, up: false, down: false},    
    _speed: 5,

    CustomControls: function(speed) {
      if (speed) this._speed = speed;
      var move = this.__move;

      this.bind('EnterFrame', function() {
        // Move the player in a direction depending on the booleans
        // Only move the player in one direction at a time (up/down/left/right)
        if (move.right) this.x += this._speed; 
        if (move.left) this.x -= this._speed; 
        if (move.up) this.y -= this._speed;
        if (move.down) this.y += this._speed;
      }).bind('KeyDown', function(e) {
        // Default movement booleans to false
        move.right = move.left = move.down = move.up = false;

        // If keys are down, set the direction
        if (e.keyCode === Crafty.keys['RIGHT_ARROW']) move.right = true;
        if (e.keyCode === Crafty.keys['LEFT_ARROW']) move.left = true;
        if (e.keyCode === Crafty.keys['UP_ARROW']) move.up = true;
        if (e.keyCode === Crafty.keys['DOWN_ARROW']) move.down = true;

        //this.preventTypeaheadFind(e);
      }).bind('KeyUp', function(e) {
        // If key is released, stop moving
        if (e.keyCode === Crafty.keys['RIGHT_ARROW']) move.right = false;
        if (e.keyCode === Crafty.keys['LEFT_ARROW']) move.left = false;
        if (e.keyCode === Crafty.keys['UP_ARROW']) move.up = false;
        if (e.keyCode === Crafty.keys['DOWN_ARROW']) move.down = false;

        //this.preventTypeaheadFind(e);
      });

      return this;
    }
  });

  // Create our player entity with some premade components
  var player = Crafty.e("2D, Canvas, Color, CustomControls, Gravity, Collision, player, SpriteAnimation")
    .attr({x: gameWidth/2, y: gameHeight-100, w: 45, h:90})
    .reel('walk_left', 400, [[0,0], [4,0], [8,0], [0,1], [4,1], [8,1], [0,2], [4,2], [8,2], [0,3], [4,3], [8,3], [0,4], [4,4], [8,4], [0,5], [4,5], [8,5], [0,6], [4,6], [8,6], [0,7], [4,7]])
    .reel('walk_right', 400, [[0,0], [4,0], [8,0], [0,1], [4,1], [8,1], [0,2], [4,2], [8,2], [0,3], [4,3], [8,3], [0,4], [4,4], [8,4], [0,5], [4,5], [8,5], [0,6], [4,6], [8,6], [0,7], [4,7]])
    .CustomControls(10)
    .gravity('Floor')
    .checkHits('Floor')
    .bind('HitOn', function(hitData){
      this.y -= velocityY;
      
      // if(hitData[0].obj.y - this.y> 80){
      //   this.y =  this.y - 5;
      // }	
    	//console.log(hitData);
    	this.resetHitChecks('Floor');
      console.info(hitData);
    })
    .bind('EnterFrame', function(){
    	if(this.x < 0){
    		this.x = 0;
    	} else if(this.x > gameWidth){
    		this.x = gameWidth;
    	}
       if (this.__move.left) {
      if (!this.isPlaying("walk_left"))
        this.pauseAnimation().animate("walk_left");
        this.flip('X');
      }
      if (this.__move.right) {
        if (!this.isPlaying("walk_right"))
        this.pauseAnimation().animate("walk_right");
        this.unflip('X');
      }
      if (this.__move.up) {
        if (!this.isPlaying("walk_up"))
          this.pauseAnimation();
      }
      if (this.__move.down) {
        if (!this.isPlaying("walk_down"))
          this.pauseAnimation();
      }
    }).bind("KeyUp", function(e) {
      this.pauseAnimation();
    });
  }

  function createBaseFloor(randomX, offsetRandom){
  	Crafty.e('Floor, 2D, Color, Canvas, Motion, Image').image('images/brickBlock.png', 'repeat')
	  .attr({x: 0, y: gameHeight, w: randomX-offsetRandom, h: 70})
	  .bind('EnterFrame', function(){
	  	this.y -= velocityY;
	  	if(this.y < -71){
	  		this.destroy();
	  		var randomX = Math.floor((Math.random() * gameWidth));
  			var offsetRandom = Math.floor((Math.random() * 4)+3) * 15;
	  		createBaseFloor(randomX, offsetRandom);
	  	}
	  	});
	  Crafty.e('Floor, 2D, Color, Canvas, Motion, Image').image('images/brickBlock.png', 'repeat')
	  .attr({x: randomX+offsetRandom, y: gameHeight, w: gameWidth-(randomX+offsetRandom), h: 70})
	  .bind('EnterFrame', function(){
	  	this.y -= velocityY;
	  	if(this.y < -71){
	  		this.destroy();
	  	}
	  	});
      for(var i = 0; i < foodPerLine; i++){
        food = Math.floor((Math.random() * 6)) + 1;
        randomXF = Math.floor((Math.random() * gameWidth));
        imageString = 'images/' + food + '.png';
        Crafty.e('Food, 2D, Canvas, Collision, Motion, Image').image(imageString)
       .attr({x: randomXF, y: gameHeight - 70, w: 70, h: 70})
       .checkHits('player')
       .bind('HitOn', function(hitData){
          //console.log(hitData);
          if((this.x - hitData[0].obj.x < 10) || (hitData[0].obj.x - this.x < 10)){
            this.destroy();
          }
        })
       .bind('EnterFrame', function(){
        this.y -= velocityY;
        if(this.y < -71){
          this.destroy();
        }
        });
      }
  }
  Crafty.scene('loadFloor', function(){
  	createPlayer();
  	var i = 0;
  	for(i = 1; i<5; i++){
  		var randomX = Math.floor((Math.random() * gameWidth));
  		var offsetRandom = Math.floor((Math.random() * 4)+3) * 20;
  		Crafty.e('Floor, 2D, Color, Canvas, Motion, Image').image('images/brickBlock.png', 'repeat')
	   .attr({x: 0, y: (gameHeight*i/4)-70, w: randomX-offsetRandom, h: 70})
	   .bind('EnterFrame', function(){
	  	this.y -= velocityY;
	  	if(this.y < -71){
	  		this.destroy();
        randomX = Math.floor((Math.random() * gameWidth));
        offsetRandom = Math.floor((Math.random() * 4)+3) * 15;
	  		createBaseFloor(randomX, offsetRandom);
	  	}
	  	});
	  Crafty.e('Floor, 2D, Color, Canvas, Motion, Image').image('images/brickBlock.png', 'repeat')
	  .attr({x: randomX+offsetRandom, y: (gameHeight*i/4)-70, w: gameWidth-(randomX+offsetRandom), h: 70})
	  .bind('EnterFrame', function(){
	  	this.y -= velocityY;
	  	if(this.y < -71){
	  		this.destroy();
	  	}
	  	});
  	}
});

  Crafty.scene('Loading', function(){
      Crafty.load(assetsObj, function(){
        Crafty.sprite(180, 340, "images/player.png", {
        player: [0,0]
        });
        Crafty.scene('loadFloor');
        //Crafty.scene('loadFood');
      });
  });
  Crafty.scene('Loading');
};