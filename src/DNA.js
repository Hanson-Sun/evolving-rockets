class DNA {
	constructor(genes) {
		if (genes) {
			this.genes = genes;
		} else {
			this.genes = [];
			for (let i = 0; i < 6; i++) {
				this.genes[i] = Rocket.randomNumber(2);
			}
		}
	}
    
    mixedCrossover(partner) {
		var newgenes = [];
		for (let i = 0; i < this.genes.length; i++) {
			var pick = Math.random() < 0.5 ? true : false;
			if (pick) {
				newgenes[i] = this.genes[i];
			}
			else {
				newgenes[i] = partner.genes[i];
			}
		}
		return new DNA(newgenes);
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
		return new DNA(newgenes);
	}

	mutation() {
		for (let i = 0; i < this.genes.length; i++) {
			if (Math.random() < 0.02) {
				this.genes[i] = Rocket.randomNumber(1);
			}
		}
	}
}