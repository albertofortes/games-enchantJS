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
	game.preload('assets/BG.png',
		'assets/penguinSheet.png',
		'assets/Ice.png',
		'assets/Hit.mp3',
		'assets/bgm.mp3')

	// Game settings
	game.fps = 30;
	game.scale = 1;
	game.onload = function() {
/*
		// una vez el juego ha terminado de cargar:
		console.log('Hola, Océano');
		// escenas, nodes y labels:
		var scene, label, bg;
		scene = new Scene();
		label = new Label('Hola, Océano');
		// background:
		bg = new Sprite(320,440);
		bg.image = game.assets['assets/BG.png'];

		// añadir items:
		scene.addChild(bg);
		scene.addChild(label);

		// start scene
		game.pushScene(scene);
*/

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

			var game, label, bg, penguin, iceGroup;

			// llamamos al constructor de la superclase Scene:
			Scene.apply(this);

			//  Access to the game singleton instance:
			game = Game.instance;

			// creamos los child nodes:
			//label = new Label('Hola, Océano');
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
			bg.image = game.assets['assets/BG.png'];

			// penguin
			/*
			penguin = new Sprite(30,43);
			penguin.image = game.assets['assets/penguinSheet.png'];
			penguin.x = game.width/2 - penguin.width/2;
			penguin.y = 280;
			*/
			penguin = new Penguin();
			penguin.x = game.width/2 - penguin.width/2;
			penguin.y = 280;
			this.penguin = penguin;

			// Ice Group
			iceGroup = new Group();
			this.iceGroup = iceGroup;

			// añadir child nodes (El orden de invocación Importa! mira explicación de iceGroup):
			this.addChild(bg);
			this.addChild(iceGroup); //By adding the iceGroup after the background but before the penguin, you make sure that the penguin will always be above the ice
			this.addChild(penguin);
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
			this.generateIceTimer = 0;
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
			this.penguin.switchToLaneNumber(lane);
		},
		update: function(evt) {
			// Score increase as time passes
			this.scoreTimer += evt.elapsed * 0.001;
			if(this.scoreTimer >= 0.5) {
				this.setScore(this.score+1);
				this.scoreTimer -= 0.5;
			}

			// generar bloques de hielo
			this.generateIceTimer += evt.elapsed * 0.001;
			if(this.generateIceTimer >= 0.5) {
				var ice;
				this.generateIceTimer -= 0.5;
				ice = new Ice(Math.floor(Math.random()*3));
				//this.addChild(ice);
				this.iceGroup.addChild(ice);
			}
			// Check collision
			for(var i = this.iceGroup.childNodes.length -1; i>=0; i--) {
				var ice;
				ice = this.iceGroup.childNodes[i];
				// intersect method that you can use to check if two sprites are intersecting
				if(ice.intersect(this.penguin)) {

					// musiquita:
					var game = Game.instance;
					game.assets['assets/Hit.mp3'].play();

					// eliminar bloque de hielo:
					this.iceGroup.removeChild(ice);

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

	// Animacion del pinguino:
	var Penguin = Class.create(Sprite, {
		// constructor:
		initialize: function(){
			// llamamso al constructor de la superclase
			Sprite.apply(this, [30,43]);
			this.image = Game.instance.assets['assets/penguinSheet.png'];
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

	// clase para los bloques de hielo:
	var Ice = Class.create(Sprite, {
		// constructor:
		initialize: function(lane){
			// llamada a la superclase Sprite
			Sprite.apply(this, [48,49]);
			this.image = Game.instance.assets['assets/Ice.png'];
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
