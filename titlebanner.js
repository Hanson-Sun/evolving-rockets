var ctx = document.getElementById("titleinteraction");
var c = ctx.getContext("2d");
var title = document.getElementById("titlebanner")
ctx.width = title.offsetWidth; //document.width is obsolete
ctx.height = title.offsetHeight //document.height is obsolete



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



var startmouse = { x: 0, y: 0 };
endmouse = { x: 0, y: 0 };
mouseisdown = false;
hold = false;
var currentcirc;

function getMousePos(c, evt) {
	var rect = c.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

title.addEventListener("mousedown", function (evt) {
	var oldmousePos = getMousePos(ctx, evt);
	startmouse.x = oldmousePos.x;
	startmouse.y = oldmousePos.y;
	mouseisdown = true;

	ok = new Obstacle(startmouse.x, startmouse.y, 10);

}, false);




var gravity = new Vector2D(0, 0.3);
var rockets = [];
var targets = [];
var obstacles = [];
var lifespan = ctx.width / 2 * ctx.height / 1500;
if(lifespan < 350){
	lifespan = 350;
}

var pos = new Vector2D(ctx.width / 2, ctx.height - 2);
var maxspeed = 4;
var maxforce = 5;


class Target {
	constructor(x, y, radius) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		targets.push(this);
	}
	targetDraw() {
		c.beginPath();
		c.fillStyle = "rgb(11, 227, 69)";
		c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		c.fill();
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
		c.fillStyle = "rgb(255,255,255)"
		c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
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

		this.error;
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

				this.seek();
				this.applyGravity();
				this.applyAcceleration();

				if (this.velocity.mag() > maxspeed) {
					this.velocity = (this.velocity.normalize()).mult(maxspeed)
				}
				this.wallCollisions();
				this.applyVelocity();

				this.acceleration.mult(0);
				this.count++;
			}

		}

	}
	seek() {

		this.closestx = Infinity;
		this.closesty = Infinity;
		var works = false;

		var targetpos = new Vector2D(target.x, target.y)
		this.desiredvelocity = this.position.sub(targetpos);
		this.error = this.velocity.sub(this.desiredvelocity);
		this.error = this.error.normalize();
		this.acceleration = (this.error.normalize()).mult(this.dna.genes[0]);

		for (o of obstacles) {
			let dx = o.x - this.position.x;
			let dy = o.y - this.position.y;

			if (dy * dy + dx * dx <= 500 * 500 * this.dna.genes[3]) {
				if (Math.abs(dx) < Math.abs(this.closestx)) {
					this.closestx = o.x;
				} if (Math.abs(dy) < Math.abs(this.closesty)) {
					this.closesty = o.y;
				}
				works = true;
			}

		}
		if (works) {
			var closestObstaclePos = new Vector2D(this.closestx, this.closesty);
			this.desiredvelocity = this.position.sub(closestObstaclePos);
			this.desiredvelocity.x = 500 * 500 * this.dna.genes[3] / this.desiredvelocity.x / this.desiredvelocity.x * this.dna.genes[5];
			this.desiredvelocity.y = 500 * 500 * this.dna.genes[3] / this.desiredvelocity.y / this.desiredvelocity.y * this.dna.genes[2];
			this.desiredvelocity = this.desiredvelocity.normalize();
			this.error = (this.velocity.normalize()).sub(this.desiredvelocity);
			this.error = (this.error.normalize()).mult(this.dna.genes[1]);
			this.acceleration = this.acceleration.add(this.error);
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
			c.fillStyle = "rgba(168, 0, 0, 0.4)";
		} else if(this.completed) {
			c.fillStyle = "rgba(0, 110, 29,0.4)";
		}else{
			c.fillStyle = " rgba(0, 0, 0, 0.4)";
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
		this.fitness = 1 / this.closeness + 1 / distance;
		if (this.completed) {
			this.fitness *= 2;
			this.fitness /= this.count / lifespan;
		}
		if (this.crash) {
			this.fitness /= 5;
		}
	}
}

class DNA {
	constructor(genes) {
		if (genes) {
			this.genes = genes;
		} else {
			this.genes = [];
			for (let i = 0; i < 6; i++) {
				this.genes[i] = randomNumber(2);
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
			if (Math.random() < 0.02) {
				this.genes[i] = randomNumber(1);
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
		this.size = 500;
		this.populationcount = 0;
		this.matingpool = [];
		for (let i = 0; i < this.size; i++) {
			generateRocket(pos.x, pos.y, randomNumber(1), 0, 0, 0);
		}
	}


	evaluate() {
		var maxfit = 0;
		var fittest;

		for (let rocket of rockets) {
			rocket.calcFitness();
			if (rocket.fitness > maxfit) {
				maxfit = rocket.fitness;
				fittest = rocket;
			}
		}
		for (let rocket of rockets) {
			rocket.fitness /= maxfit;
		}
		this.matingpool = [];
		for (let rocket of rockets) {
			var n = rocket.fitness * 100;
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
			pos = new Vector2D(ctx.width / 2, ctx.height - 10);
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



for (i = ctx.width * 0.3; i < ctx.width * 0.7; i = i + 10) {
	var obstacle = new Obstacle(1 + i, 300, 10);
}
for (i = 0; i < ctx.width * 1; i = i + 10) {
	var obstacle = new Obstacle(1 + i, 60, 10);
}

for (i = ctx.width * 0.4; i < ctx.width * 0.6; i = i + 10) {
	var obstacle = new Obstacle(1 + i, 400, 10);
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


