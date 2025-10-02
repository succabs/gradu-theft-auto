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
        const mapWidth = 800;
        const mapHeight = 4000;

        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

        // Keskikaista (Kauppakatu)
        this.add.rectangle(
            mapWidth / 2,
            mapHeight / 2,
            300,
            mapHeight,
            0xdddddd
        );

        // Vasemmat rakennukset
        for (let y = 0; y < mapHeight; y += 300) {
            this.add.rectangle(100, y + 100, 200, 250, 0x9999cc); // Rakennus
        }

        // Oikeat rakennukset
        for (let y = 150; y < mapHeight; y += 300) {
            this.add.rectangle(700, y + 100, 200, 250, 0xcc9999); // Rakennus
        }

        // Kirjasto ylhäällä
        this.libraryZone = this.add.rectangle(
            mapWidth / 2,
            100,
            300,
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
        this.feissari = new Feissari(this, 400, 3000);
        this.pomoSoitettu = false;

        this.grilliKaveri = new GrilliKaveri(this, 400, 2800);

        this.physics.add.overlap(this.player, this.grilliKaveri, () => {
            if (!this.grilliKaveri.triggered) {
                this.grilliKaveri.trigger(this.player);
            }
        });

        // Kamera seuraa
        this.cameras.main.startFollow(this.player);

        // Pelaaja ei voi mennä ulos maailmasta
        this.player.setCollideWorldBounds(true);

        this.physics.add.overlap(this.player, this.feissari, () => {
            if (!this.feissari.triggered) {
                this.feissari.triggered = true;
                this.feissari.trigger(this.player);
            }
        });

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

        this.pomoSoitettu = false;

        if (this.krapulaHuomenna) {
            this.player.slowNextDay = true;
            this.krapulaHuomenna = false;
        } else {
            this.player.slowNextDay = false;
        }

        if (this.grilliKaveri) {
            this.grilliKaveri.reset();
        }

        if (this.feissari) {
            this.feissari.reset();
        }

        this.scene.get("HudScene").setDay(this.currentDay);
        this.scene.get("HudScene").setGradu(this.graduProgress);

        // Resetoi pelaaja kompassille (alas)
        this.player.setPosition(400, 3900);
        this.cameras.main.fadeIn(500);
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

        if (!this.pomoSoitettu && this.player.y < 3600) {
            this.pomoSoitettu = true;
            this.player.state = "stunned";
            this.player.setVelocity(0); // ← tämä pysäyttää kaiken liikkeen

            new PomoPuhelu(this, this.player);
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
}

