import { Application, IApplicationOptions, Graphics } from "pixi.js";

export class GameRenderer {
	app: Application<HTMLCanvasElement>;
	style: CSSStyleDeclaration;

	constructor(options: Partial<IApplicationOptions>) {
		this.app = new Application<HTMLCanvasElement>(options);
		this.style = this.app.view.style;
		document.body.appendChild(this.app.view);
		const graphic = new Graphics();
		graphic.beginFill(0xffff00);
		graphic.lineStyle(5, 0xffff00);
		graphic.drawRect(0, 0, 100, 100);
		this.app.stage.addChild(graphic);
	}
}
