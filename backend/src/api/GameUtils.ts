export class GameUtils {
	static generateRandomEntity() {
		let theta;
		let startPoint;
		let moveEntity;
		const randNumForBorder = Math.random() * 4;
		// top
		if (randNumForBorder >= 3) {
			theta = Math.PI * Math.random();
			startPoint = [Math.random(), 0];
			moveEntity = [0, -1];
		}
		// right
		else if (randNumForBorder >= 2) {
			theta = Math.PI * Math.random() + Math.PI / 2;
			startPoint = [1, Math.random()];
			moveEntity = [1, 0];
		}
		// bottom
		else if (randNumForBorder >= 1) {
			theta = Math.PI * Math.random() + Math.PI;
			startPoint = [Math.random(), 1];
			moveEntity = [0, 1];
		}
		// left
		else {
			theta = (1.5 * Math.PI + Math.PI * Math.random()) % (2 * Math.PI);
			startPoint = [0, Math.random()];
			moveEntity = [-1, 0];
		}
		const speed = 0.5 + Math.random() ** 2 * 4;
		return { startPoint, theta, moveEntity, speed };
	}

	static generateRandomAsteroid() {
		const randomData = GameUtils.generateRandomEntity();
		const scale = Math.sqrt(1 / Math.pow(2, Math.floor(Math.random() * 3)));
		const style = Math.floor(Math.random() * 3);
	}
}
