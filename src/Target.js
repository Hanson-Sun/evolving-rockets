class Target {
	constructor(x, y, radius) {
		this.x = x;
		this.y = y;
		this.radius = radius;
	}
	
	targetDraw() {
		c.beginPath();
		c.fillStyle = "rgb(11, 227, 69)";
		c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		c.fill();
	}
}