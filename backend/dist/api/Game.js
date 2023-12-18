"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const Message_1 = require("./Message");
const GameUtils_1 = require("./GameUtils");
const AlienShip_1 = require("./AlienShip");
const Ship_1 = require("./Ship");
class Game {
    constructor(name) {
        this.clients = [];
        this.generateAsteroidInterval = 1000;
        this.alienShips = [];
        this.alienId = 0;
        this.asteroidId = 0;
        this.alienShotId = 0;
        this.ships = [];
        this.name = name;
    }
    setShipData(data) {
        const { type } = data.data;
        if (type === "ship") {
            const { id, down, key } = data.data;
            const msgData = {
                data: { type: "ship", data: { action: "keypress", id, down, key } },
            };
            console.log("test");
            console.log(msgData);
            this.clients.forEach((client) => {
                client.sendMessage(new Message_1.Message(Message_1.MessageType.GAME_DATA, msgData));
            });
        }
    }
    addClient(client) {
        this.clients.push(client);
        const responseData = { data: { success: true, error: null, data: this.getInfo() } };
        for (const client of this.clients) {
            const response = new Message_1.Message(Message_1.MessageType.GET_GAME_INFO, responseData);
            client.sendMessage(response);
        }
    }
    generateAlienShip() {
        const alienShipData = GameUtils_1.GameUtils.generateRandomEntity();
        alienShipData.id = this.alienId;
        this.alienShips.push(new AlienShip_1.AlienShip(this.alienId, (shipId) => this.generateAlienShot(shipId)));
        this.alienId = ++this.alienId % Game.maxId;
        const alienShipMsg = {
            data: { type: "alienShip", data: alienShipData },
        };
        this.clients.forEach((client) => {
            const msg = new Message_1.Message(Message_1.MessageType.GAME_DATA, alienShipMsg);
            client.sendMessage(msg);
        });
    }
    generateAlienShot(shipId) {
        const alienShotData = GameUtils_1.GameUtils.generateRandomEntity();
        alienShotData.shipId = shipId;
        alienShotData.id = this.alienShotId;
        this.alienShotId = ++this.alienShotId % Game.maxId;
        const alienShotMsg = {
            data: {
                type: "alienShot",
                data: alienShotData,
            },
        };
        this.clients.forEach((client) => {
            const msg = new Message_1.Message(Message_1.MessageType.GAME_DATA, alienShotMsg);
            client.sendMessage(msg);
        });
    }
    generateAsteroids() {
        const asteroidData = GameUtils_1.GameUtils.generateRandomAsteroid();
        asteroidData.id = this.asteroidId;
        this.asteroidId = ++this.asteroidId % Game.maxId;
        const data = {
            data: { type: "asteroid", data: asteroidData },
        };
        this.clients.forEach((client) => {
            const msg = new Message_1.Message(Message_1.MessageType.GAME_DATA, data);
            client.sendMessage(msg);
        });
    }
    generateClientShips() {
        const diff = 1 / (this.clients.length + 1);
        const data = {
            data: {
                type: "ship",
                data: { speed: 10, position: [0, 1], theta: Math.PI / 4, moveEntity: [0, 1], id: 0 },
            },
        };
        this.clients.forEach((client, i) => {
            this.ships.push(new Ship_1.Ship(i));
            data.data.data.position[0] = diff * (i + 1);
            data.data.data.id = i;
            const msg = new Message_1.Message(Message_1.MessageType.GAME_DATA, data);
            client.sendMessage(msg);
        });
    }
    start() {
        this.clients.forEach((client, i) => {
            const msg = new Message_1.Message(Message_1.MessageType.START_GAME, { data: {} });
            client.sendMessage(msg);
        });
        this.generateClientShips();
        setInterval(() => {
            if (Math.random() < 0.05) {
                this.generateAlienShip();
            }
            this.generateAsteroids();
        }, this.generateAsteroidInterval);
    }
    getInfo() {
        return {
            name: this.name,
            clients: this.clients.map((client) => client.name),
        };
    }
}
exports.Game = Game;
Game.maxId = 1000;
