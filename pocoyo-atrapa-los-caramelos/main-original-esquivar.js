// http://www.raywenderlich.com/23370/how-to-make-a-simple-html5-game-with-enchant-js

// start enchant.js
enchant();

// Document on load
window.onload = function() {

	// Starting point
	//var windowWidth = window.innerWidth;
	//var windowHeight = window.innerHeight;
	//var game = new Game(windowWidth, windowHeight);
	var game = new Game(320, 440);


	//Preload resources
	game.preload('assets/background.png',
		'assets/pocoyo-sheet.png',
		'assets/candy.png',
		'assets/Hit.mp3',
		'assets/bgm.mp3')

	// Game settings
	game.fps = 30;
	game.scale = 1;
	game.onload = function() {

		var scene = new SceneGame();
		game.pushScene(scene);

	}

	// start:
	game.start();
	window.scrollTo(0, 0);

	// clase SceneGame hereda de la clase Scene
	var SceneGame = Class.create(Scene, {
		// constructor (initialize):
		initialize: function() {

			var game, label, bg, character, candyGroup;

			// llamamos al constructor de la superclase Scene:
			Scene.apply(this);

			//  Access to the game singleton instance:
			game = Game.instance;

			// creamos los child nodes:
			label = new Label('SCORE<br />0');
			label.x = 9;
			label.y = 32;
			label.color = 'white';
			label.font = '19px strong Arial';
			label.textAlign = 'center';
			label._style.textShadow ="-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
			this.scoreLabel = label;

			// background:
			bg = new Sprite(320,440);
			bg.image = game.assets['assets/background.png'];

			// character
			character = new Character();
			character.x = game.width/2 - character.width/2;
			character.y = 350;
			this.character = character;

			// caramelos candy Group
			candyGroup = new Group();
			this.candyGroup = candyGroup;

			// añadir child nodes (El orden de invocación Importa! mira explicación de candyGroup):
			this.addChild(bg);
			this.addChild(candyGroup); //By adding the candyGroup after the background but before the character, you make sure that the character will always be above the candy
			this.addChild(character);
			this.addChild(label);

			// Touch Detection
			/*
			TOUCH_START: fires when the mouse button is clicked or a finger touches the screen.
			TOUCH_MOVE: keeps firing as long as the player drags a mouse while pressing the button, or moves a finger that’s continually touching the screen.
			TOUCH_END: fires once the player releases the mouse button, or lifts the finger off the screen.
			*/
			this.addEventListener(Event.TOUCH_START, this.handleTouchControl);

			// Update
			this.addEventListener(Event.ENTER_FRAME, this.update);

			// Instance variables
			this.generateCandyTimer = 0;
			this.scoreTimer = 0;
			this.score = 0;

			// Background music
			this.bgm = game.assets['assets/bgm.mp3'];
			// Start BGM
			this.bgm.play();
			// Loop BGM
			if (this.bgm.currentTime >= this.bgm.duration ){
			    this.bgm.play();
			}

		},
		handleTouchControl: function(evt) {
			var laneWidth, lane;
			laneWidth = 320/3;
			lane = Math.floor(evt.x/laneWidth);
			lane = Math.max(Math.min(2, lane), 0);
			this.character.switchToLaneNumber(lane);
		},
		update: function(evt) {
			// Score increase as time passes
			this.scoreTimer += evt.elapsed * 0.001;
			if(this.scoreTimer >= 0.5) {
				this.setScore(this.score+1);
				this.scoreTimer -= 0.5;
			}

			// generar bloques de hielo
			this.generateCandyTimer += evt.elapsed * 0.001;
			if(this.generateCandyTimer >= 0.5) {
				var candy;
				this.generateCandyTimer -= 0.5;
				candy = new Candy(Math.floor(Math.random()*3));
				//this.addChild(candy);
				this.candyGroup.addChild(candy);
			}
			// Check collision
			for(var i = this.candyGroup.childNodes.length -1; i>=0; i--) {
				var candy;
				candy = this.candyGroup.childNodes[i];
				// intersect method that you can use to check if two sprites are intersecting
				if(candy.intersect(this.character)) {

					// musiquita:
					var game = Game.instance;
					game.assets['assets/Hit.mp3'].play();

					// eliminar bloque de hielo:
					this.candyGroup.removeChild(candy);

					// game over:
					this.bgm.stop();
					game.replaceScene(new SceneGameOver(this.score));

					break;
				}
			}
		},
		setScore: function(value) {
			this.score = value;
			this.scoreLabel.text = 'SCORE<br />' + this.score;
		}
	});

	// Animacion del Personaje:
	var Character = Class.create(Sprite, {
		// constructor:
		initialize: function(){
			// llamamso al constructor de la superclase
			Sprite.apply(this, [30,40]);
			this.image = Game.instance.assets['assets/pocoyo-sheet.png'];
			// animación:
			this.animationDuration = 0;
			this.addEventListener(Event.ENTER_FRAME, this.updateAnimation);
		},
		updateAnimation: function(evt){
			this.animationDuration += evt.elapsed * 0.001;
			if(this.animationDuration >= 0.25) {
				this.frame = (this.frame + 1) % 2;
				this.animationDuration -= 0.25;
			}
		},
		switchToLaneNumber: function(lane){
			var targetX = 160 - this.width/2 + (lane-1)*90;
			this.x = targetX;
		}
	});

	// clase para los bloques de caramelos:
	var Candy = Class.create(Sprite, {
		// constructor:
		initialize: function(lane){
			// llamada a la superclase Sprite
			Sprite.apply(this, [50,80]);
			this.image = Game.instance.assets['assets/candy.png'];
			this.rotationSpeed = 0;
			this.setLane(lane);
			this.addEventListener(Event.ENTER_FRAME, this.update);
		},
		setLane: function(lane){
			var game, distance;
			game = Game.instance;
			distance = 90;

			this.rotationSpeed = Math.random() * 100 - 50;
			this.x = game.width/2 - this.width/2 + (lane-1) * distance;
			this.y = -this.height;
			this.rotation = Math.floor(Math.random()*360);
		},
		update: function(evt){
			var ySpeed, game;
			game = Game.instance;
			ySpeed = 300;

			this.y += ySpeed * evt.elapsed * 0.001;
			this.rotation += this.rotationSpeed * evt.elapsed * 0.001;
			if(this.y > game.height){
				this.parentNode.removeChild(this);
			}

		}
	});

	// Game Over
	var SceneGameOver = Class.create(Scene, {
		initialize: function(score) {
			var gameOverlabel, scoreLabel;
			Scene.apply(this);
			this.backgroundColor = '#000000'; // or 'black' or 'rgb(0,0,0)'
			// Game Over label
			gameOverLabel = new Label("GAME OVER<br />Toca para jugar de nuevo.");
			gameOverLabel.x = 8;
			gameOverLabel.y = 200;
			gameOverLabel.color = 'white';
			gameOverLabel.font = '21px strong Arial';
			gameOverLabel.textAlign = 'center';
			// Score label
			scoreLabel = new Label('SCORE<br />' + score);
			scoreLabel.x = 9;
			scoreLabel.y = 32;
			scoreLabel.color = 'white';
			scoreLabel.font = '19px strong Arial';
			scoreLabel.textAlign = 'center';
			// Add labels
			this.addChild(gameOverLabel);
			this.addChild(scoreLabel);

			// Listen for taps
			this.addEventListener(Event.TOUCH_START, this.touchToRestart);
		},
		touchToRestart: function(evt) {
		    var game = Game.instance;
		    game.replaceScene(new SceneGame());
		}
	});


};
