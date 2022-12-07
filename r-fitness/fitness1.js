var ctx = document.getElementById("fitness1");
var c = ctx.getContext("2d");
ctx.width = document.body.clientWidth;
ctx.height = document.body.clientHeight;
ctx.width = 450;
var stats = document.getElementById("stats")

var closeness = document.getElementById("closeness").value;
var fitnesstype = document.getElementById("fitnesstype").value;
var sucessbonus = document.getElementById("sucessbonus").value;
var collidepenalty = document.getElementById("collidepenalty").value;
var bonus = document.getElementById("bonus").value;
var penalty = document.getElementById("penalty").value;
var scale = document.getElementById("scale").value;
var populationsize = document.getElementById("size").value;

var generationcount = 0;
var sucessnumber = 0;

function updatefunction() {
	closeness = document.getElementById("closeness").value;
	fitnesstype = document.getElementById("fitnesstype").value;
	sucessbonus = document.getElementById("sucessbonus").value;
	collidepenalty = document.getElementById("collidepenalty").value;
	bonus = document.getElementById("bonus").value;
	penalty = document.getElementById("penalty").value;
	scale = document.getElementById("scale").value;
	populationsize = document.getElementById("size").value;
	population.populationcount = Infinity;
	rockets = [];
	population = new Population();
	generationcount = 0;
	stats.innerHTML = "";
}

class Vector2D {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	add(vect) {
		return (new Vector2D(this.x + vect.x, this.y + vect.y));
	}

	sub(vect) {
		return (new Vector2D(this.x - vect.x, this.y - vect.y));
	}
	mult(a) {
		return (new Vector2D(this.x * a, this.y * a));
	}

	dot(vect) {
		return this.x * vect.x + this.y * vect.y;
	}

	cross(vect) {
		return this.x * vect.y - this.y * vect.x;
	}

	mag() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y));
	}
	magsqr() {
		return (Math.pow(this.x, 2)) + (Math.pow(this.y, 2));
	}

	normalize() {
		this.mag = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
		return (new Vector2D((this.x / this.mag), (this.y / this.mag)))
	}

	findAngle(vect, type = "deg") {
		this.dot = this.x * vect.x + this.y * vect.y;
		this.mag1 = ((this.x ** 2) + (this.y ** 2)) ** 0.5;
		this.mag2 = ((vect.x ** 2) + (vect.y ** 2)) ** 0.5;
		if (type == "deg") {
			return Math.acos(this.dot / this.mag1 / this.mag2) * 180 / Math.PI;
		} else if (type == "rad") {
			return Math.acos(this.dot / this.mag1 / this.mag2);
		}
	}
}





function getMousePos(c, evt) {
	var rect = ctx.getBoundingClientRect();
	console.log(rect)
	scaleX = ctx.width / rect.width,    // relationship bitmap vs. element for X
     scaleY = ctx.height / rect.height;  // relationship bitmap vs. element for Y
	return {
		x: (evt.clientX - rect.left)*scaleX,
		y: (evt.clientY - rect.top)*scaleY
	};
}

ctx.addEventListener("mousedown", function (evt) {
	var oldmousePos = getMousePos(ctx, evt);
	new Obstacle(oldmousePos.x, oldmousePos.y, 10);

}, false);

var gravity = new Vector2D(0, 0.001);
var rockets = [];
var targets = [];
var obstacles = [];
var lifespan = 350;
var pos = new Vector2D(ctx.width / 2, ctx.height - 2);


class Target {
	constructor(x, y, radius) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		targets.push(this);
	}
	targetDraw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		c.fillStyle = "rgba(50, 255, 90, 0.4)";
		c.fill();
		c.stroke();
	}
}
class Obstacle {
	constructor(x, y, radius) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		obstacles.push(this);
	}
	obstacleDraw() {
		c.beginPath();

		c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		c.fillStyle = "rgba(186, 186, 186, 0.9)";

		c.fill();

	}

}
class Rocket {
	constructor(position, velocity, acceleration, dna = new DNA()) {
		this.position = position;
		this.velocity = velocity;
		this.acceleration = acceleration;
		this.dna = dna;
		this.completed = false;
		this.crash = false;
		this.count = 0;
		rockets.push(this);
		this.isrun = true;
		this.fitness = 0;
		this.closeness = Infinity;
	}
	applyForce(x) {
		this.acceleration = this.acceleration.add(x)
	}
	applyAcceleration() {
		this.velocity = this.velocity.add(this.acceleration);
	}
	applyVelocity() {
		this.position = this.position.add(this.velocity);
	}
	applyGravity() {
		this.acceleration = this.acceleration.add(gravity)
	}
	wallCollisions() {
		if (this.position.x >= ctx.width) {
			this.position.x = ctx.width;
			this.velocity.x *= -1;

		} if (this.position.x <= 0) {
			this.position.x = 0;
			this.velocity.x *= -1;

		} if (this.position.y >= ctx.height) {
			this.position.y = ctx.height;
			this.velocity.y *= -1;

		} if (this.position.y <= 0) {
			this.position.y = 0;
			this.velocity.y *= -1;
		}
	}


	targetCollision() {
		var distance = ((this.position.x - target.x) ** 2 + (this.position.y - target.y) ** 2);
		if (distance < target.radius * target.radius) {
			this.completed = true;
			sucessnumber++;
		}
	}

	obstacleCollision() {
		for (o of obstacles) {
			var distance = ((this.position.x - o.x) ** 2 + (this.position.y - o.y) ** 2);
			if (distance < o.radius * o.radius) {
				this.crash = true;
			}
		}
	}
	updatePosition() {
		if (this.count >= lifespan) {
			var index = rockets.indexOf(this);
			if (index > -1) {
				rockets.splice(index, 1);
			}
			this.isrun = false;
		}
		if (this.isrun) {
			this.obstacleCollision();
			this.targetCollision();
			this.calculateCloseness();
			if (!this.completed && !this.crash) {
				this.applyForce(this.dna.genes[this.count]);
				this.applyAcceleration();
				this.applyGravity();
				if (this.velocity.mag() > 5) { this.velocity = (this.velocity.normalize()).mult(5) }
				this.applyVelocity();
				this.wallCollisions();
				this.acceleration.mult(0);
				this.count++;
			}

		}

	}

	drawPosition() {
		//0.244978,  22.36067977 1.5707

		var hyp = 11.180;
		var angle = 1.5707;
		var theta = Math.atan2(-this.velocity.x, this.velocity.y) + angle;

		var path = new Path2D();
		path.moveTo(this.position.x + hyp * Math.cos(theta + 3.6051521), this.position.y + hyp * Math.sin(theta + 3.6051521));
		path.lineTo(this.position.x + 20 * Math.cos(theta), this.position.y + 20 * Math.sin(theta));
		path.lineTo(this.position.x + hyp * Math.cos(theta + 2.67785867), this.position.y + hyp * Math.sin(theta + 2.67785867));
		if (this.crash) {
			c.fillStyle = "rgba(250, 80, 80, 0.5)";
		} else if(this.completed) {
			c.fillStyle = "rgba(112, 255, 110, 0.5)";
		}else{
			c.fillStyle = " rgba(255, 255, 255, 0.4)";
		}

		c.fill(path);

	}
	calculateCloseness() {
		var distance = ((this.position.x - target.x) ** 2 + (this.position.y - target.y) ** 2);
		if (distance < this.closeness) {
			this.closeness = distance;
		}
	}
	calcFitness() {
		var distance = ((this.position.x - target.x) ** 2 + (this.position.y - target.y) ** 2);
		var closenessbool = 1;
		if (closeness == false) {
			closenessbool = 0;
		}
		if (fitnesstype == "inverse") {
			this.fitness = closenessbool* 1 / this.closeness + 1 / distance;
		} else if (fitnesstype == "inversesqr") {
			this.fitness = closenessbool*1 / this.closeness ** 2 + 1 / distance ** 2;
		} else if (fitnesstype == "linear") {
			this.fitness = -closenessbool*this.closeness - distance;
		} else if (fitnesstype == "inversecube") {
			this.fitness = closenessbool*1 / this.closeness ** 3 + 1 / distance ** 3;
		} else if (fitnesstype == "log") {
			this.fitness = -closenessbool*Math.log(this.closeness) / Math.log(1000) - Math.log(distance) / Math.log(1000);

		}
		if (sucessbonus == true) {
			if (this.completed) {
				this.fitness *= bonus;
			}
		}
		if (collidepenalty == true) {
			if (this.crash) {
				this.fitness *= penalty;
			}
		}
	}



}

class DNA {
	constructor(genes) {
		if (genes) {
			this.genes = genes;
		} else {
			this.genes = [];
			for (let i = 0; i < lifespan; i++) {
				this.genes[i] = new Vector2D(randomNumber(0.01), randomNumber(0.01));
			}
		}

	}
	crossover(partner) {
		/*
		var newgenes = [];
		for (let i = 0; i < this.genes.length; i++) {
			var pick = Math.random() < 0.5 ? true : false;
			if (pick) {
				newgenes[i] = this.genes[i];
			}
			else {
				newgenes[i] = partner.genes[i];
			}
		}*/

		var newgenes = [];
		var mid = Math.floor(Math.random() * this.genes.length);
		for (let i = 0; i < this.genes.length; i++) {
			if (i < mid) {
				newgenes[i] = this.genes[i];
			}
			else {
				newgenes[i] = partner.genes[i];
			}

		}

		return new DNA(newgenes);
	}

	mutation() {
		for (let i = 0; i < this.genes.length; i++) {
			if (Math.random() < 0.01) {
				this.genes[i] = new Vector2D(randomNumber(0.01), randomNumber(0.01));
			}
		}
	}
}
function randomNumber(size) {
	let sign = Math.random() < 0.5 ? -1 : 1;
	return size * sign * Math.random();
}

function generateRocket(x, y, vx, vy, ax, ay) {
	pos = new Vector2D(x, y);
	vel = new Vector2D(vx, vy);
	a = new Vector2D(ax, ay);
	r = new Rocket(pos, vel, a)
}

class Population {
	constructor() {
		this.rockets = rockets;
		this.size = populationsize;
		this.populationcount = 0;
		this.matingpool = [];
		for (let i = 0; i < this.size; i++) {
			generateRocket(pos.x, pos.y, 0, 0, 0, 0);
		}
	}


	evaluate() {
		var maxfit = -Infinity;
		var minfit = Infinity;

		var fittestrocket = 0;

		for (let rocket of rockets) {
			rocket.calcFitness();
			if (rocket.fitness > maxfit) {
				maxfit = rocket.fitness;
				fittestrocket = rocket;
			} if (rocket.fitness < minfit) {
				minfit = rocket.fitness;
			}
		}

		for (let rocket of rockets) {
			rocket.fitness -= minfit;

		}
		maxfit = maxfit - minfit;
		generationcount++;


		for (let rocket of rockets) {
			rocket.fitness /= maxfit;
		}
		sucessnumber = 0;

		stats.innerHTML = "";
		stats.innerHTML += "Generation " + generationcount + "<br>"
		stats.innerHTML += "Maximum Fitness (scaled): " + maxfit * scale + "<br>";
		stats.innerHTML += "Minimum Fitness (scaled): " + minfit * scale + "<br>";
		stats.innerHTML += "Closest Distance Reached: " + (fittestrocket.closeness**0.5) + "<br>";

		this.matingpool = [];
		for (let rocket of rockets) {
			var n = rocket.fitness * scale;
			for (var j = 0; j < n; j++) {
				this.matingpool.push(rocket);
			}
		}
	}

	selection() {
		var newpopulation = [];
		for (var i = 0; i < this.size; i++) {

			var parent1 = this.matingpool[Math.floor(Math.random() * this.matingpool.length)].dna;
			var parent2 = this.matingpool[Math.floor(Math.random() * this.matingpool.length)].dna;

			var child = parent1.crossover(parent2);
			child.mutation();
			pos = new Vector2D(ctx.width / 2, ctx.height - 2);
			vel = new Vector2D(0, 0);
			a = new Vector2D(0, 0);
			var newrocket = new Rocket(pos, vel, a, child);
			newpopulation.push(newrocket);
		}
		this.rockets = newpopulation;

	}

	run() {
		for (let r of this.rockets) {
			r.updatePosition();
			r.drawPosition();
		}
	}

}



var population = new Population();
var target = new Target(ctx.width / 2, 150, 20);

for (i = 0; i < ctx.width * 0.7; i = i + 10) {
	var obstacle = new Obstacle(50 + i, 300, 10);
}
for (i = 0; i < ctx.width * 1; i = i + 10) {
	var obstacle = new Obstacle(1 + i, 60, 10);
}

for (i = 0; i < ctx.width * 0.5; i = i + 10) {
	var obstacle = new Obstacle(100 + i, 400, 10);
}



function animate() {
	c.clearRect(0, 0, ctx.width, ctx.height);

	target.targetDraw();
	for (o of obstacles) {
		o.obstacleDraw();
	}

	population.run();
	population.populationcount++;
	if (population.populationcount >= lifespan) {
		population.evaluate();
		population.selection();
		population.populationcount = 0;
	}

	window.requestAnimationFrame(animate);
}
window.requestAnimationFrame(animate);


