import { Application, TickerCallback, Text } from "pixi.js";
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

	static addChildText(text: Text) {
		CanvasEngine.singleton.app.stage.addChild(text);
	}

	static clear() {
		this.singleton.app.stage.removeChildren();
	}

	static setCanvasSize(height: number, width: number) {
		if (this.singleton == null) {
			return;
		}
		this.singleton.app.view.height = height;
		this.singleton.app.view.width = width;
	}

	static setCanvasPosition(x: number, y: number) {
		if (this.singleton == null) {
			return;
		}
		this.singleton.app.view.style.top = `${y}px`;
		this.singleton.app.view.style.left = `${x}px`;
	}
}
