class Population {
	constructor() {
		this.rockets = [];
		this.size = populationsize;
		this.populationcount = 0;
		this.matingpool = [];

	}

	evaluate() {
		var maxfit = -Infinity;
		var minfit = Infinity;
		let averageFit = 0;
		var fittestrocket = 0;

		for (let rocket of this.rockets) {
			rocket.calcFitness(closeness, fitnesstype, sucessbonus, collidepenalty);
			if (rocket.fitness > maxfit) {
				maxfit = rocket.fitness;
				fittestrocket = rocket;
			} if (rocket.fitness < minfit) {
				minfit = rocket.fitness;
			}
		}

		for (let rocket of this.rockets) {
			rocket.fitness -= minfit;
		}

		maxfit = maxfit - minfit;
		generationcount++;

		for (let rocket of this.rockets) {
			rocket.fitness /= maxfit;
		}

		for (let rocket of this.rockets) {
			if (!isNaN(rocket.fitness)) {
				averageFit += rocket.fitness;
			}
		}

		sucessnumber = 0;

		stats.innerHTML = "";
		stats.innerHTML += "Generation " + generationcount + "<br>"
		stats.innerHTML += "Maximum Fitness (raw): " + maxfit * scale + "<br>";
		stats.innerHTML += "Minimum Fitness (raw): " + minfit * scale + "<br>";
		stats.innerHTML += "Average Fitness (scaled): " + averageFit + "<br>";
		stats.innerHTML += "Closest Distance Reached: " + (fittestrocket.closeness) ** 0.5 + "<br>";

		generationList.push(generationcount)
		averageFitList.push(averageFit);

		chart.update();

		averageFit = 0;

		this.matingpool = [];
		for (let r of this.rockets) {
			var n = r.fitness * scale;
			for (var j = 0; j < n; j++) {
				this.matingpool.push(r);
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
			var pos = new Vector2D(ctx.width / 2, ctx.height - 10);
			var vel = new Vector2D(0, 0);
			var a = new Vector2D(0, 0);
			var newrocket = new SmartRocket(pos, vel, a, child);
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

	static generateRocket(x, y, vx, vy, ax, ay) {
		var pos = new Vector2D(x, y);
		var vel = new Vector2D(vx, vy);
		var a = new Vector2D(ax, ay);
		var r = new Rocket(pos, vel, a);
		return r;
	}
}