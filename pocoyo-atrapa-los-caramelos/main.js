// start enchant.js
enchant();

// Document on load
window.onload = function() {

	// Starting point
	var gameWidth = parseInt(window.innerWidth);
	var gameHeight = parseInt(window.innerHeight);
	var game = new Game(gameWidth, gameHeight);
	//var game = new Game(320, 440);

	//Preload resources
	game.preload('assets/background-320.png',
		'assets/background-410.png',
		'assets/background-768.png',
		'assets/snow.jpg',
		'assets/pocoyo-sheet.png',
		'assets/candy.png',
		'assets/pause.png',
		'assets/play.png',
		'assets/mute.png',
		'assets/speaker.png',
		'assets/caramelo.mp3',
		'assets/bg-music.mp3')

	// Game settings
	game.fps = 30;
	game.scale = 1;
	game.onload = function() {

		var scene = new SceneGame();
		game.pushScene(scene);

	}

	// start:
	game.start();
	window.scrollTo(0, 0); //para ios

	// clase SceneGame hereda de la clase Scene
	var SceneGame = Class.create(Scene, {
		// constructor (initialize):
		initialize: function() {

			var game, label, fLabel, bg, character, candyGroup, sensorBottom, pauseBt, resumeBt;

			// llamamos al constructor de la superclase Scene:
			Scene.apply(this);

			//  Access to the game singleton instance:
			game = Game.instance;

			// creamos los child nodes:
			//label = new Label('Hola, Océano');
			label = new Label('SCORE: 0');
			label.x = 5;
			label.y = 15;
			label.color = 'white';
			label.font = '19px sans-serif';
			//label.textAlign = 'center';
			label._style.textShadow ="-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
			this.scoreLabel = label;

			fLabel = new Label('FALLOS: 0');
			fLabel.x = 5;
			fLabel.y = 40;
			fLabel.color = '#f00';
			fLabel.font = '19px Arial';
			//fLabel.textAlign = 'center';
			fLabel._style.textShadow ="-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
			this.failLabel = fLabel;

			// background:
			//bg = new Sprite(320,440);
			bg = new Sprite(gameWidth, gameHeight);
			if(gameWidth <= 320) {
				bg.image = game.assets['assets/background-320.png'];
			} else if(gameWidth <= 410) {
				bg.image = game.assets['assets/background-410.png'];
			} else if(gameWidth <= 768) {
				bg.image = game.assets['assets/background-768.png'];
			} else {
				bg.image = game.assets['assets/background-768.png'];
			}

			// barra detectar fondo
			//sensorBottom = new Sprite(320,440);
			sensorBottom = new Sprite(gameWidth, gameHeight);
			//sensorBottom.image = game.assets['assets/pocoyo-sheet.png'];
			sensorBottom.x = 0;
			sensorBottom.y = gameHeight;
			this.sensorBottom = sensorBottom;

			// pausa
			pauseBt = new Sprite(30,30);
			pauseBt.image = game.assets['assets/pause.png'];
			pauseBt.x = gameWidth-40;
			pauseBt.y = 10;
			this.pauseBt = pauseBt;

			// pausa
			resumeBt = new Sprite(30,30);
			resumeBt.image = game.assets['assets/play.png'];
			resumeBt.x = -500; // fuera del lienzo
			resumeBt.y = 10;
			this.resumeBt = resumeBt;

			// boton mute:
			muteBt = new Sprite(30,30);
			muteBt.image = game.assets['assets/speaker.png'];
			muteBt.x = gameWidth-85;
			muteBt.y = 10;
			this.muteBt = muteBt;

			// boton speaker poner musica de nuevo:
			speakerBt = new Sprite(30,30);
			speakerBt.image = game.assets['assets/mute.png'];
			speakerBt.x = -500;
			speakerBt.y = 10;
			this.speakerBt = speakerBt;

			// character
			character = new Character();
			character.x = game.width/2 - character.width/2;
			//character.y = 350;
			character.y = gameHeight-90;
			this.character = character;

			// caramelos candy Group
			candyGroup = new Group();
			this.candyGroup = candyGroup;

			// añadir child nodes (El orden de invocación Importa! mira explicación de candyGroup):
			this.addChild(bg);
			this.addChild(candyGroup); //By adding the candyGroup after the background but before the character, you make sure that the character will always be above the candy
			this.addChild(character);
			this.addChild(pauseBt);
			this.addChild(resumeBt);
			this.addChild(muteBt);
			this.addChild(speakerBt);
			this.addChild(label);
			this.addChild(fLabel);
			this.addChild(sensorBottom);

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
			this.countFails = 20;

			// Background music
			this.bgm = game.assets['assets/bg-music.mp3'];
			// Start BGM
			this.bgm.play();
			this.bgm.src.loop = true;

			// pausa:
			pauseBt.addEventListener(Event.TOUCH_END, this.pause);

			// continua:
			resumeBt.addEventListener(Event.TOUCH_END, this.resume);

			// mute:
			muteBt.addEventListener(Event.TOUCH_END, this.mute);

			// quitar mute y volver a poner musiquita:
			speakerBt.addEventListener(Event.TOUCH_END, this.musicOn);

		},
		mute: function() {
			// quitar musica:
			game.currentScene.bgm.pause();
			// oculto botón de mute y muestro el de altavoces:
			game.currentScene.muteBt.x = -500;
			game.currentScene.speakerBt.x = gameWidth-85;
		},
		musicOn: function() {
			// volver a poner musica:
			game.currentScene.bgm.play();
			// oculto botón de mute y muestro el de altavoces:
			game.currentScene.muteBt.x = gameWidth-85;
			game.currentScene.speakerBt.x = -500;
		},
		pause: function() {
			// paro juego y musica:
			game.pause();
			game.currentScene.bgm.pause();
			// oculto botón de pausa y muestro el de play:
			game.currentScene.pauseBt.x = -500;
			game.currentScene.resumeBt.x = gameWidth-40;
		},
		resume: function() {
			// restauro juego y musica:
			game.resume();
			game.currentScene.bgm.play();
			// oculto botón de play y muestro el de pausa:
			game.currentScene.pauseBt.x = gameWidth-40;
			game.currentScene.resumeBt.x = -500;
		},
		handleTouchControl: function(evt) {
			var laneWidth, lane;
			//laneWidth = 320/3;
			laneWidth = gameWidth/3;
			lane = Math.floor(evt.x/laneWidth);
			lane = Math.max(Math.min(2, lane), 0);
			this.character.switchToLaneNumber(lane);
		},
		update: function(evt) {

			// generar bloques de hielo
			this.generateCandyTimer += evt.elapsed * 0.001;
			if(this.generateCandyTimer >= 0.5) {
				var candy;
				this.generateCandyTimer -= 0.5;
				candy = new Candy(Math.floor(Math.random()*3));
				this.candyGroup.addChild(candy);
			}

			var game = Game.instance;

			// Check collision
			for(var i = this.candyGroup.childNodes.length -1; i>=0; i--) {
				var candy;
				candy = this.candyGroup.childNodes[i];

				// intersect method that you can use to check if two sprites are intersecting
				if(candy.intersect(this.character)) {

					// incrementa el score:
					this.setScore(this.score+1);

					// musiquita:
					game.assets['assets/caramelo.mp3'].play();

					// eliminar bloque de hielo:
					this.candyGroup.removeChild(candy);

					break;
				}

				// gameover:
				if( candy.intersect(this.sensorBottom) ) {

					this.setFails(this.countFails-1);
					this.candyGroup.removeChild(candy);

					if(this.countFails < 1){
						this.bgm.stop();
						game.replaceScene(new SceneGameOver(this.score))
					}

					break;

				}

			}

		},
		setScore: function(value) {
			this.score = value;
			this.scoreLabel.text = 'SCORE<br />' + this.score;
		},
		setFails: function(countFails) {
			this.countFails = countFails;
			this.failLabel.text = 'Fails<br />' + this.countFails;
		}
	});

	// Animacion del Personaje:
	var Character = Class.create(Sprite, {
		// constructor:
		initialize: function(){
			// llamamso al constructor de la superclase
			Sprite.apply(this, [50,80]);
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
			//var targetX = 160 - this.width/2 + (lane-1)*90;
			distance = parseInt(gameWidth/3);
			var targetX = (gameWidth/2) - this.width/2 + (lane-1)*distance;
			this.x = targetX;
		}

	});

	// clase para los bloques de caramelos:
	var Candy = Class.create(Sprite, {
		// constructor:
		initialize: function(lane){
			// llamada a la superclase Sprite
			Sprite.apply(this, [50,50]);
			this.image = Game.instance.assets['assets/candy.png'];
			this.rotationSpeed = 0;
			this.setLane(lane);
			this.addEventListener(Event.ENTER_FRAME, this.update);
		},
		setLane: function(lane){
			var game, distance;
			game = Game.instance;
			//distance = 90;
			distance = parseInt(gameWidth/3);

			this.rotationSpeed = Math.random() * 100 - 50;
			this.x = game.width/2 - this.width/2 + (lane-1) * distance;
			this.y = -this.height;
			this.rotation = Math.floor(Math.random()*360);
		},
		update: function(evt){
			var ySpeed, game;
			game = Game.instance;
			ySpeed = 150; // velocidad de caida de los caramelos del juego

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
			gameOverLabel.x = gameWidth/3;
			gameOverLabel.y = 200;
			gameOverLabel.color = 'white';
			gameOverLabel.font = '21px sans-serif';
			gameOverLabel.textAlign = 'center';
			// Score label
			scoreLabel = new Label('SCORE<br />' + score);
			scoreLabel.x = gameWidth/3;
			scoreLabel.y = 32;
			scoreLabel.color = 'white';
			scoreLabel.font = '19px sans-serif';
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
