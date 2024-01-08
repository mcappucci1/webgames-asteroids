"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const Message_1 = require("./Message");
const GameUtils_1 = require("../entities/GameUtils");
const AlienShip_1 = require("../entities/AlienShip");
const Shot_1 = require("../entities/Shot");
const Asteroid_1 = require("../entities/Asteroid");
const Ship_1 = require("../entities/Ship");
class Game {
    constructor(name, controller) {
        this.started = false;
        this.clients = [];
        this.generateAsteroidInterval = 1000;
        this.entityId = 0;
        this.entityIds = new Map();
        this.score = 0;
        this.name = name;
        this.controller = controller;
    }
    shipHandler(data) {
        for (const client of this.clients) {
            client.sendMessage(true, undefined, Message_1.MessageType.GAME_DATA, data);
        }
    }
    destoryHandler(data) {
        const { id } = data;
        const entity = this.entityIds.get(id);
        if (entity == null) {
            return;
        }
        this.entityIds.delete(id);
        this.score += entity.score;
        if (entity.split && entity.canSplit()) {
            const entities = entity.splitEntity(data.location);
            for (const entity of entities) {
                entity.id = this.entityId;
                const { style, scale, speed, theta } = entity;
                const asteroid = new Asteroid_1.Asteroid(this.entityId, scale, speed, theta, style);
                this.entityIds.set(this.entityId, asteroid);
                this.entityId = ++this.entityId % Game.maxId;
                const data = {
                    type: "asteroid",
                    data: entity,
                };
                for (const client of this.clients) {
                    client.sendMessage(true, undefined, Message_1.MessageType.GAME_DATA, data);
                }
            }
        }
        else if (entity instanceof Ship_1.Ship) {
            entity.lives -= 1;
            if (entity.lives > 0) {
                console.log(entity.lives);
                const i = this.clients.findIndex((client) => client.getId() === id);
                const ship = this.generateClientShip(this.clients[i], Game.shipColors[i], [0.5, 1], entity.lives);
                const data = {
                    type: "ship",
                    data: {
                        action: "createShips",
                        ships: [ship],
                    },
                };
                for (const client of this.clients) {
                    client.sendMessage(true, undefined, Message_1.MessageType.GAME_DATA, data);
                }
            }
            else {
                this.entityIds.delete(entity.id);
            }
        }
        const msgData = {
            type: "score",
            data: this.score,
        };
        for (const client of this.clients) {
            client.sendMessage(true, undefined, Message_1.MessageType.GAME_DATA, msgData);
        }
    }
    gameDataMsgHandler(data) {
        const { type } = data.data;
        if (type === "ship") {
            this.shipHandler(data.data);
        }
        else if (type === "destroy") {
            this.destoryHandler(data.data);
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
        alienShipData.id = this.entityId;
        this.entityIds.set(this.entityId, new AlienShip_1.AlienShip(this.entityId, (shipId) => this.generateAlienShot(shipId)));
        this.entityId = ++this.entityId % Game.maxId;
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
        alienShotData.id = this.entityId;
        this.entityIds.set(this.entityId, new Shot_1.Shot(this.entityId));
        this.entityId = ++this.entityId % Game.maxId;
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
        asteroidData.id = this.entityId;
        const { style, scale, speed, theta } = asteroidData;
        const asteroid = new Asteroid_1.Asteroid(this.entityId, scale, speed, theta, style);
        this.entityIds.set(this.entityId, asteroid);
        this.entityId = ++this.entityId % Game.maxId;
        const data = {
            type: "asteroid",
            data: asteroidData,
        };
        for (const client of this.clients) {
            client.sendMessage(true, undefined, Message_1.MessageType.GAME_DATA, data);
        }
    }
    generateClientShip(client, color, position, lives = 3) {
        const ship = {
            id: client.getId(),
            speed: 2,
            lives: lives,
            moveEntity: [0, 1],
            color: color,
            name: client.name,
            theta: (3 * Math.PI) / 2,
            position: position,
        };
        this.entityIds.set(client.getId(), new Ship_1.Ship(client.getId(), client.name, lives));
        return ship;
    }
    generateClientShips() {
        const diff = 1 / (this.clients.length + 1);
        const ships = [];
        for (let i = 0; i < this.clients.length; ++i) {
            ships.push(this.generateClientShip(this.clients[i], Game.shipColors[i], [diff * (i + 1), 1]));
        }
        const data = {
            type: "ship",
            data: {
                action: "createShips",
                ships,
            },
        };
        for (const client of this.clients) {
            client.sendMessage(true, undefined, Message_1.MessageType.GAME_DATA, data);
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
            if (Math.random() < 0.05) {
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
Game.maxClients = 6;
Game.maxId = 1000;
Game.shipColors = [0x8888ff, 0xffff00, 0xff00ff, 0x00ffff, 0xff0000, 0x00ff00, 0x0000ff, 0xff8888];
