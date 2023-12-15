import { Application, TickerCallback } from "pixi.js";
import { Entity } from "./Entity";

export class CanvasEngine {
	static singleton: CanvasEngine = new CanvasEngine();
	private app: Application<HTMLCanvasElement>;

	constructor() {
		this.app = new Application<HTMLCanvasElement>({
			width: window.innerWidth,
			height: window.innerHeight,
			backgroundAlpha: 0,
			antialias: true,
			resizeTo: window,
		});
		this.app.view.style.position = "absolute";
		this.app.view.style.top = "0";
		document.body.appendChild(this.app.view);
	}

	static addTickerCB(cb: TickerCallback<null>) {
		CanvasEngine.singleton.app.ticker.add(cb);
	}

	static removeTickerCB(cb: TickerCallback<null>) {
		CanvasEngine.singleton.app.ticker.remove(cb);
	}

	static addChild(entity: Entity) {
		CanvasEngine.singleton.app.stage.addChild(entity.graphic);
	}

	static clear() {
		this.singleton.app.stage.removeChildren();
	}
}
