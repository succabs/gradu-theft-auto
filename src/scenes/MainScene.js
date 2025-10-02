import { Scene } from "phaser";
import { Player } from "../gameobjects/Player";
import { Feissari } from "../gameobjects/Feissari";
import { PomoPuhelu } from "../gameobjects/PomoPuhelu";
import { GrilliKaveri } from "../gameobjects/GrilliKaveri";

export class MainScene extends Scene {
    player = null;
    cursors = null;

    currentDay = 1;
    maxDays = 21;
    graduProgress = 0;
    dayTimeLimit = 120; // sekunteina esim. 5min = 300s, testivaiheessa vaikka 30
    elapsedTime = 0;
    dayEnded = false;

    constructor() {
        super("MainScene");
    }

    createMap() {
        // Määritetään maailmalle rajat
        this.mapWidth = 800;
        this.mapHeight = 4000;
        this.streetWidth = 300;
        this.streetMinX = (this.mapWidth - this.streetWidth) / 2 + 40;
        this.streetMaxX = this.mapWidth - this.streetMinX;
        this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
        this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);

        // Keskikaista (Kauppakatu)
        this.add.rectangle(
            this.mapWidth / 2,
            this.mapHeight / 2,
            this.streetWidth,
            this.mapHeight,
            0xdddddd
        );

        // Vasemmat rakennukset
        for (let y = 0; y < this.mapHeight; y += 300) {
            this.add.rectangle(100, y + 100, 200, 250, 0x9999cc); // Rakennus
        }

        // Oikeat rakennukset
        for (let y = 150; y < this.mapHeight; y += 300) {
            this.add.rectangle(700, y + 100, 200, 250, 0xcc9999); // Rakennus
        }

        // Kadun rajat (näkymättömät esteet)
        const wallThickness = 40;
        this.streetWalls = [
            this.add
                .zone(
                    this.streetMinX - wallThickness / 2,
                    this.mapHeight / 2,
                    wallThickness,
                    this.mapHeight
                )
                .setOrigin(0.5),
            this.add
                .zone(
                    this.streetMaxX + wallThickness / 2,
                    this.mapHeight / 2,
                    wallThickness,
                    this.mapHeight
                )
                .setOrigin(0.5),
        ];

        this.streetWalls.forEach((wall) => {
            this.physics.add.existing(wall, true);
            wall.body.updateFromGameObject();
        });

        // Kirjasto ylhäällä
        this.libraryZone = this.add.rectangle(
            this.mapWidth / 2,
            100,
            this.streetWidth,
            100,
            0x66cc66
        );
        this.physics.add.existing(this.libraryZone, true); // static body
    }

    init() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.scene.launch("MenuScene");
    }

    create() {
        this.createMap();

        // Pelaaja alareunaan, keskelle katua
        this.player = new Player({ scene: this });
        this.player.setPosition(400, 3900);

        // Random encounterit
        this.feissariGroup = this.physics.add.group({ runChildUpdate: true });
        this.pomoSoitettu = false;

        this.grilliKaveri = new GrilliKaveri(this, -1000, -1000);
        this.grilliKaveri.deactivate();

        if (this.streetWalls) {
            this.streetWalls.forEach((wall) => {
                this.physics.add.collider(this.player, wall);
                this.physics.add.collider(this.feissariGroup, wall);
                this.physics.add.collider(this.grilliKaveri, wall);
            });
        }

        this.physics.add.collider(
            this.player,
            this.feissariGroup,
            this.handleFeissariEncounter,
            null,
            this
        );

        this.physics.add.collider(
            this.player,
            this.grilliKaveri,
            this.handleGrilliEncounter,
            null,
            this
        );

        this.pomoZone = this.add.zone(-1000, -1000, 80, 80);
        this.physics.add.existing(this.pomoZone);
        this.pomoZone.body.setAllowGravity(false);
        this.pomoZone.body.moves = false;
        this.disablePomoZone();

        this.physics.add.overlap(this.player, this.pomoZone, () => {
            if (this.pomoSoitettu) return;
            this.pomoSoitettu = true;
            this.disablePomoZone();
            this.player.state = "stunned";
            this.player.setVelocity(0);
            new PomoPuhelu(this, this.player);
        });

        // Kamera seuraa
        this.cameras.main.startFollow(this.player);

        // Pelaaja ei voi mennä ulos maailmasta
        this.player.setCollideWorldBounds(true);

        // Cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // This event comes from MenuScene
        this.game.events.on("start-game", () => {
            this.scene.stop("MenuScene");
            this.scene.launch("HudScene", {
                currentDay: this.currentDay,
                maxDays: this.maxDays,
                graduProgress: this.graduProgress,
                remainingTime: this.dayTimeLimit,
            });

            this.setupDailyEncounters();
            this.player.start();
        });
    }

    endDay(reachedLibrary) {
        this.dayEnded = true;

        if (reachedLibrary) {
            this.graduProgress += Phaser.Math.Between(5, 15); // esim. 5–15 %/päivä
            console.log("Gradua edistetty. Nyt:", this.graduProgress, "%");
        } else {
            console.log("Et päässyt kirjastoon.");
        }

        if (this.graduProgress >= 100) {
            this.scene.start("GameCompleteScene");
            return;
        }

        if (this.currentDay >= this.maxDays) {
            this.scene.start("GameOverScene");
            return;
        }

        // Seuraava päivä
        this.currentDay++;
        this.elapsedTime = 0;
        this.dayEnded = false;
        this.libraryReached = false;

        if (this.krapulaHuomenna) {
            this.player.slowNextDay = true;
            this.krapulaHuomenna = false;
        } else {
            this.player.slowNextDay = false;
        }

        this.pomoSoitettu = false;

        this.scene.get("HudScene").setDay(this.currentDay);
        this.scene.get("HudScene").setGradu(this.graduProgress);

        // Resetoi pelaaja kompassille (alas)
        this.player.setPosition(400, 3900);
        this.cameras.main.fadeIn(500);
        this.setupDailyEncounters();
        this.player.start();
    }

    update() {
        this.player.update();

        // Player movement entries
        this.player.move({
            up: this.cursors.up.isDown,
            down: this.cursors.down.isDown,
            left: this.cursors.left.isDown,
            right: this.cursors.right.isDown,
        });

        if (
            this.physics.overlap(this.player, this.libraryZone) &&
            !this.libraryReached
        ) {
            this.libraryReached = true;
            console.log("Saavuit kirjastoon!");

            // Odotetaan hetki ja lopetetaan päivä
            this.time.delayedCall(1000, () => {
                this.endDay(true);
            });
        }

        if (this.dayEnded) return;

        this.elapsedTime += this.game.loop.delta / 1000;

        // 🔽 LISÄÄ TÄMÄ TÄHÄN KOHTAAN
        const timeLeft = Math.max(
            0,
            Math.floor(this.dayTimeLimit - this.elapsedTime)
        );
        this.scene.get("HudScene").updateTime(timeLeft);

        if (this.elapsedTime >= this.dayTimeLimit) {
            this.endDay(false); // ei päästy kirjastoon
        }
    }

    setupDailyEncounters() {
        if (!this.feissariGroup) return;

        this.clearFeissarit();

        const reservedPositions = [];
        this.spawnFeissarit(reservedPositions);

        if (this.grilliKaveri) {
            const grilliPos = this.getRandomStreetPosition(
                reservedPositions,
                120
            );
            reservedPositions.push(grilliPos);
            this.grilliKaveri.activateAt(grilliPos.x, grilliPos.y);
        }

        const pomoPos = this.getRandomStreetPosition(reservedPositions, 120);
        reservedPositions.push(pomoPos);
        this.enablePomoZone(pomoPos.x, pomoPos.y);
        this.pomoSoitettu = false;
    }

    spawnFeissarit(reservedPositions) {
        const count = Phaser.Math.Between(1, 10);

        for (let i = 0; i < count; i++) {
            const position = this.getRandomStreetPosition(
                reservedPositions,
                120
            );
            reservedPositions.push(position);
            const feissari = new Feissari(this, position.x, position.y);
            this.feissariGroup.add(feissari);
            feissari.activateAt(
                position.x,
                position.y,
                this.streetMinX,
                this.streetMaxX
            );
        }
    }

    clearFeissarit() {
        if (this.feissariGroup) {
            this.feissariGroup.clear(true, true);
        }
    }

    getRandomStreetPosition(reservedPositions = [], minDistance = 100) {
        const mapWidth = 800;
        const streetWidth = 300;
        const streetMinX = this.streetMinX ?? 290;
        const streetMaxX = this.streetMaxX ?? 510;
        const minY = 300;
        const maxY = this.mapHeight ? this.mapHeight - 200 : 3800;

        let attempts = 0;
        while (attempts < 30) {
            const x = Phaser.Math.Between(streetMinX, streetMaxX);
            const y = Phaser.Math.Between(minY, maxY);

            const tooClose = reservedPositions.some((pos) => {
                return (
                    Phaser.Math.Distance.Between(x, y, pos.x, pos.y) <
                    minDistance
                );
            });

            if (!tooClose) {
                return { x, y };
            }

            attempts++;
        }

        return {
            x: Phaser.Math.Between(streetMinX, streetMaxX),
            y: Phaser.Math.Between(minY, maxY),
        };
    }
    handleFeissariEncounter(player, feissari) {
        feissari.trigger(player);
    }

    handleGrilliEncounter(player, grilli) {
        if (!grilli.triggered) {
            grilli.trigger(player);
        }
    }

    enablePomoZone(x, y) {
        if (!this.pomoZone) return;
        this.pomoZone.setPosition(x, y);
        this.pomoZone.body.enable = true;
        this.pomoZone.active = true;
    }

    disablePomoZone() {
        if (!this.pomoZone) return;
        this.pomoZone.body.enable = false;
        this.pomoZone.active = false;
        this.pomoZone.setPosition(-1000, -1000);
    }
}

