class Rocket {
	constructor(position, velocity, acceleration, dna = new DNA()) {
		this.position = position;
		this.velocity = velocity;
		this.acceleration = acceleration;
		this.dna = dna;
		this.completed = false;
		this.crash = false;
		this.count = 0;
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

	calcFitness(closeness, fitnesstype, sucessbonus, collidepenalty) {
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

	static randomNumber(size) {
		let sign = Math.random() < 0.5 ? -1 : 1;
		return size * sign * Math.random();
	}
	
}