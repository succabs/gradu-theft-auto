import { Physics } from "phaser";

export class GrilliKaveri extends Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "player"); // Käytetään placeholder-spriteä, vaihda kun saat oman
        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setImmovable(true);
        this.triggered = false;
    }

    reset() {
        this.triggered = false;
    }

    trigger(player) {
        this.triggered = true;

        player.state = "stunned";
        player.setVelocity(0);

        const text = this.scene.add
            .text(this.x, this.y - 50, "Tuutko grillaamaan?", {
                font: "16px Arial",
                fill: "#000",
                backgroundColor: "#99ccff",
                padding: { x: 6, y: 4 },
            })
            .setOrigin(0.5);

        this.scene.time.delayedCall(3000, () => {
            text.destroy();
            this.scene.krapulaHuomenna = true;
            this.scene.endDay(false); // Skippaa loppupäivän
        });
    }
}

