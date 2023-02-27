class DNA {
	constructor(genes, size = 6, mutationRange = 1, initialRange = 2, mutationProbability = 0.02) {
		this.mutationRange = mutationRange;
		this.initialRange = initialRange;
		this.size = size;
		this.mutationProbability = mutationProbability;
		if (genes) {
			this.genes = genes;
		} else {
			this.genes = [];
			for (let i = 0; i < this.size; i++) {
				this.genes[i] = this.randomGene();
			}
		}
	}

	randomGene() {
		return Rocket.randomNumber(this.initialRange);
	}

	newDNA(newgenes) {
		return new DNA(newgenes);
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
		return this.newDNA(newgenes);
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
			if (Math.random() < this.mutationProbability) {
				this.genes[i] = Rocket.randomNumber(this.mutationRange);
			}
		}
	}
}