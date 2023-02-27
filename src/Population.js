class Population {
	constructor(ctx, populationsize) {
		this.rockets = [];
		this.size = populationsize;
		this.populationcount = 0;
		this.matingpool = [];
		this.ctx = ctx;

	}

	calculateFitness(r) {
		r.calcFitness(true, "inverse", true, false, 1, 2);
	}

	evaluate(scale) {
		var maxfit = -Infinity;
		var minfit = Infinity;
		let averageFit = 0;
		var fittestrocket = 0;
		var count = 0;

		for (let rocket of this.rockets) {
			this.calculateFitness(rocket);
			if (rocket.fitness > maxfit) {
				maxfit = rocket.fitness;
				fittestrocket = rocket;
			} if (rocket.fitness < minfit) {
				minfit = rocket.fitness;
			}
		}

		for (let rocket of this.rockets) {
			if (!isNaN(rocket.fitness)) {
				rocket.fitness /= maxfit;
			}
		}

		// for (let rocket of this.rockets) {
		// 	if (!isNaN(rocket.fitness)) {
		// 		rocket.fitness -= minfit/maxfit;
		// 	}
		// }

		// maxfit = maxfit - minfit;
		generationcount++;

		for (let rocket of this.rockets) {
			if (!isNaN(rocket.fitness)) {
				averageFit += rocket.fitness;
				count++;
			}
		}
		averageFit = averageFit / count;

		sucessnumber = 0;

		stats.innerHTML = "";
		stats.innerHTML += "Generation " + generationcount + "<br> "
		stats.innerHTML += "Maximum Fitness (raw): " + maxfit + "<br>";
		stats.innerHTML += "Minimum Fitness (raw): " + minfit + "<br>";
		stats.innerHTML += "Average Fitness (raw): " + averageFit + "<br>";
		stats.innerHTML += "Closest Distance Reached: " + (fittestrocket.closeness) ** 0.5 + "<br>";

		generationList.push(generationcount)
		averageFitList.push(averageFit);
		chart.update();

		averageFit = 0;

		this.matingpool = [];
		for (let r of this.rockets) {
			var n = r.fitness * scale;
			for (var j = 1; j < n; j++) {
				this.matingpool.push(r);
			}
		}

	}

	selection() {
		this.rockets = [];
		for (var i = 0; i < this.size; i++) {
			var parent1 = this.matingpool[Math.floor(Math.random() * this.matingpool.length)].dna;
			var parent2 = this.matingpool[Math.floor(Math.random() * this.matingpool.length)].dna;
			var child = parent1.crossover(parent2);
			child.mutation();
			var r = this.generateRocket(this.ctx.width / 2, this.ctx.height - 10, 0, 0, 0, 0);
			r.dna = child;
		}
	}

	run() {
		for (let r of this.rockets) {
			r.updatePosition();
			r.drawPosition();
		}
	}

	generateRocket(x, y, vx, vy, ax, ay) {
		var pos = new Vector2D(x, y);
		var vel = new Vector2D(vx, vy);
		var a = new Vector2D(ax, ay);
		var r = new Rocket(pos, vel, a);
		this.rockets.push(r);
		return r;
	}
}