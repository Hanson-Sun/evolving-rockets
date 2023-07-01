class Obstacle {
	constructor(x, y, radius) {
		this.x = x;
		this.y = y;
		this.radius = radius;
	}
	obstacleDraw() {
		c.beginPath();
		c.fillStyle = "rgb(255,255,255)"
		c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		c.fill();
	}

}