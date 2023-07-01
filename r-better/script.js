const ctx = document.getElementById("test");
const c = ctx.getContext("2d");
ctx.width = document.body.clientWidth; //document.width is obsolete
ctx.height = document.body.clientHeight; //document.height is obsolete
ctx.width = 500;
ctx.height = 1000;

var closeness = document.getElementById("closeness").value;
var fitnesstype = document.getElementById("fitnesstype").value;
var sucessbonus = document.getElementById("sucessbonus").value;
var collidepenalty = document.getElementById("collidepenalty").value;
var bonus = document.getElementById("bonus").value;
var penalty = document.getElementById("penalty").value;
var scale = document.getElementById("scale").value;
var populationsize = document.getElementById("size").value;

let generationcount = 0;
let sucessnumber = 0;

let generationList =[0];
let averageFitList = [0];

const gravity = new Vector2D(0, 0.3);
let targets = [];
let obstacles = [];
const lifespan = 350;
let pos = new Vector2D(ctx.width / 2, ctx.height - 2);
const maxspeed = 4;
const maxforce = 5;

let chart = new Chart("chart", {
	type: "line",
	data: {
		labels: generationList,
		datasets: [{
		  fill: false,
		  lineTension: 0.2,
		  backgroundColor: "rgba(0,0,255,1.0)",
		  borderColor: "rgba(0,0,255,0.1)",
		  data: averageFitList
		}]
	  },
	  options: {
		legend: {display: false}
	  }
  });

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
	if (populationsize < 100) {
		populationsize = 100;
	}
	population = new SmartPopulation();
	generationcount = 0;
	stats.innerHTML = "";
	generationList = [0];
	averageFitList = [0];

	chart = new Chart("chart", {
		type: "line",
		data: {
			labels: generationList,
			datasets: [{
			  fill: false,
			  lineTension: 0.2,
			  backgroundColor: "rgba(0,0,255,1.0)",
			  borderColor: "rgba(0,0,255,0.1)",
			  data: averageFitList
			}]
		  },
		  options: {
			legend: {display: false}
		  }
	  });

}

function generateObstacles() {
	for (i = 0; i < ctx.width * 0.7; i = i + 10) {
		obstacles.push(new Obstacle(50 + i, 300, 10));
	}
	for (i = 0; i < ctx.width * 1; i = i + 10) {
		obstacles.push(new Obstacle(1 + i, 60, 10));
	}
	
	for (i = 0; i < ctx.width * 0.5; i = i + 10) {
		obstacles.push(new Obstacle(100 + i, 400, 10));
	}
}


class SmartRocket extends Rocket {
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
}


class SmartPopulation extends Population {
	constructor() {
		super();
		for (let i = 0; i < this.size; i++) {
			this.rockets.push(SmartPopulation.generateRocket(pos.x, pos.y, Rocket.randomNumber(1), 0, 0, 0));
		}
	}

	static generateRocket(x, y, vx, vy, ax, ay) {
		var pos = new Vector2D(x, y);
		var vel = new Vector2D(vx, vy);
		var a = new Vector2D(ax, ay);
		var r = new SmartRocket(pos, vel, a);
		return r;
	}
}


<<<<<<< HEAD
let population = new SmartPopulation(ctx, populationsize);
targets.push(new Target(ctx.width / 2, 150, 20));
=======
var population = new SmartPopulation();
var target = new Target(ctx.width / 2, 150, 20);
>>>>>>> parent of 0b62018 (resolved DNA bugs)
generateObstacles();

function animate() {
	rockets = [];
	c.clearRect(0, 0, ctx.width, ctx.height);

	for (let target of targets) {
		target.targetDraw();
	}

	
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


// Event listeners
function getMousePos(c, evt) {
	var rect = ctx.getBoundingClientRect();
	console.log(rect)
	scaleX = ctx.width / rect.width,    // relationship bitmap vs. element for X
		scaleY = ctx.height / rect.height;  // relationship bitmap vs. element for Y
	return {
		x: (evt.clientX - rect.left) * scaleX,
		y: (evt.clientY - rect.top) * scaleY
	};
}

ctx.addEventListener("mousedown", function (evt) {
	var oldmousePos = getMousePos(ctx, evt);
	new Obstacle(oldmousePos.x, oldmousePos.y, 10);

}, false);


