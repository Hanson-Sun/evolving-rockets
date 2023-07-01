var ctx = document.getElementById("test");
var c = ctx.getContext("2d");
ctx.width = document.body.clientWidth; //document.width is obsolete
ctx.height = document.body.clientHeight; //document.height is obsolete
ctx.width = 500;
ctx.height = 1000;

var gravity = new Vector2D(0, 0.001);
var targets = [];
var obstacles = [];
var lifespan = 350;
var pos = new Vector2D(ctx.width / 2, ctx.height - 2);
var populationsize = 1000;

var generationcount = 0;
var sucessnumber = 0;

var generationList =[0];
var averageFitList = [0];

var chart = new Chart("chart", {
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


class BruteForceDNA extends DNA {
	constructor(genes) {
        super(genes, lifespan, 0.01, 0.01, 0.01);
	}

    randomGene() {
		return new Vector2D(Rocket.randomNumber(this.initialRange), Rocket.randomNumber(this.initialRange));
	}

    crossover(partner) {
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
		return new BruteForceDNA(newgenes);
	}

    mutation() {
		for (let i = 0; i < this.genes.length; i++) {
			if (Math.random() < this.mutationProbability) {
				this.genes[i] = new Vector2D(Rocket.randomNumber(this.mutationRange), Rocket.randomNumber(this.mutationRange));
			}
		}
	}
}

class BruteForceRocket extends Rocket {
	constructor(position, velocity, acceleration, dna = new BruteForceDNA()) {
        super(position, velocity, acceleration, dna);
	}

    updatePosition() {
		if (this.count >= lifespan) {
			var index = this.rockets.indexOf(this);
			if (index > -1) {
				this.rockets.splice(index, 1);
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
				if(this.velocity.mag()>5){this.velocity= (this.velocity.normalize()).mult(5)}
				this.applyVelocity();
				this.wallCollisions();
				this.acceleration.mult(0);
				this.count++;
			}
		}
	}

    calcFitness() {
		var distance = ((this.position.x - target.x) ** 2 + (this.position.y - target.y) ** 2);
		this.fitness = 1 / this.closeness + 1 / distance;
		if (this.completed) {
			this.fitness *= 2;
		}
	}
}

class BruteForcePopulation extends Population {
	constructor(ctx, populationsize) {
		super(ctx, populationsize);
		for (let i = 0; i < this.size; i++) {
			this.generateRocket(pos.x, pos.y, Rocket.randomNumber(1), 0, 0, 0);
		}
	}

	generateRocket(x, y, vx, vy, ax, ay) {
		var pos = new Vector2D(x, y);
		var vel = new Vector2D(vx, vy);
		var a = new Vector2D(ax, ay);
		var r = new BruteForceRocket(pos, vel, a);
        this.rockets.push(r);
		return r;
	}

}


var population = new BruteForcePopulation(ctx, populationsize);
var target = new Target(ctx.width / 2, 150, 20);
generateObstacles();

function animate() {
	c.clearRect(0, 0, ctx.width, ctx.height);

	for (let target of targets) {
		target.targetDraw();
	}
	for (let o of obstacles) {
		o.obstacleDraw();
	}

	population.run();
	population.populationcount++;
	if (population.populationcount >= lifespan) {
		population.evaluate(100);
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


