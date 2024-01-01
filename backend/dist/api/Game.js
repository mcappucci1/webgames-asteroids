"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const Message_1 = require("./Message");
const GameUtils_1 = require("./GameUtils");
const AlienShip_1 = require("./AlienShip");
const Ship_1 = require("./Ship");
class Game {
    constructor(name, controller) {
        this.started = false;
        this.clients = [];
        this.generateAsteroidInterval = 1000;
        this.alienShips = [];
        this.alienId = 0;
        this.asteroidId = 0;
        this.alienShotId = 0;
        this.ships = [];
        this.name = name;
        this.controller = controller;
    }
    setShipData(data) {
        for (const client of this.clients) {
            client.sendMessage(true, undefined, Message_1.MessageType.GAME_DATA, data);
        }
    }
    addClient(client) {
        if (this.clients.length === Game.maxClients || this.started) {
            return false;
        }
        client.setGame(this);
        this.clients.push(client);
        const responseData = this.getInfo();
        for (const client of this.clients) {
            client.sendMessage(true, undefined, Message_1.MessageType.GET_GAME_INFO, responseData);
        }
        return true;
    }
    removeClient(client) {
        const i = this.clients.indexOf(client);
        if (i === -1) {
            return false;
        }
        this.clients.splice(i, 1);
        client.setGame(undefined);
        const responseData = this.getInfo();
        for (const client of this.clients) {
            client.sendMessage(true, undefined, Message_1.MessageType.GET_GAME_INFO, responseData);
        }
        if (this.clients.length === 0) {
            this.destroy();
        }
        return true;
    }
    generateAlienShip() {
        const alienShipData = GameUtils_1.GameUtils.generateRandomEntity();
        alienShipData.id = this.alienId;
        this.alienShips.push(new AlienShip_1.AlienShip(this.alienId, (shipId) => this.generateAlienShot(shipId)));
        this.alienId = ++this.alienId % Game.maxId;
        const alienShipMsg = {
            type: "alienShip",
            data: alienShipData,
        };
        for (const client of this.clients) {
            client.sendMessage(true, undefined, Message_1.MessageType.GAME_DATA, alienShipMsg);
        }
    }
    generateAlienShot(shipId) {
        const alienShotData = GameUtils_1.GameUtils.generateRandomEntity();
        alienShotData.shipId = shipId;
        alienShotData.id = this.alienShotId;
        this.alienShotId = ++this.alienShotId % Game.maxId;
        const alienShotMsgData = {
            type: "alienShot",
            data: alienShotData,
        };
        for (const client of this.clients) {
            client.sendMessage(true, undefined, Message_1.MessageType.GAME_DATA, alienShotMsgData);
        }
    }
    generateAsteroids() {
        const asteroidData = GameUtils_1.GameUtils.generateRandomAsteroid();
        asteroidData.id = this.asteroidId;
        this.asteroidId = ++this.asteroidId % Game.maxId;
        const data = {
            type: "asteroid",
            data: asteroidData,
        };
        for (const client of this.clients) {
            client.sendMessage(true, undefined, Message_1.MessageType.GAME_DATA, data);
        }
    }
    generateClientShips() {
        const diff = 1 / (this.clients.length + 1);
        const data = {
            type: "ship",
            data: {
                speed: 4,
                position: [0, 1],
                theta: (3 * Math.PI) / 2,
                moveEntity: [0, 1],
                id: 0,
            },
        };
        for (let i = 0; i < this.clients.length; ++i) {
            this.ships.push(new Ship_1.Ship(i));
            data.data.position[0] = diff * (i + 1);
            data.data.id = i;
            this.clients[i].sendMessage(true, undefined, Message_1.MessageType.GAME_DATA, data);
        }
    }
    start() {
        if (this.started) {
            return;
        }
        this.started = true;
        for (const client of this.clients) {
            client.sendMessage(true, undefined, Message_1.MessageType.START_GAME, undefined);
        }
        this.generateClientShips();
        setInterval(() => {
            if (Math.random() < 0.25) {
                this.generateAlienShip();
            }
            this.generateAsteroids();
        }, this.generateAsteroidInterval);
    }
    destroy() {
        if (this.generateAsteroidInterval != null) {
            clearInterval(this.generateAsteroidInterval);
        }
        for (const client of this.clients) {
            client.setGame(undefined);
        }
        this.controller.removeGame(this.name);
    }
    getInfo() {
        return {
            name: this.name,
            clients: this.clients.map((client) => client.name),
        };
    }
}
exports.Game = Game;
Game.maxClients = 8;
Game.maxId = 1000;
