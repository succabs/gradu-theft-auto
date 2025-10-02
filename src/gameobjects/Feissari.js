import { GameObjects, Physics } from "phaser";

export class Feissari extends Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "feissari");
        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setDisplaySize(64, 64);
        this.body.setSize(64, 64);
        this.setImmovable(true);
    }

    reset() {
        this.triggered = false;
    }

    trigger(player, onComplete) {
        // Pysäytä pelaaja
        player.state = "stunned";
        player.setVelocity(0);

        // Näytä puhekupla
        const text = this.scene.add
            .text(this.x, this.y - 50, "Onks liittymäasiat kunnossa?", {
                font: "16px Arial",
                fill: "#000",
                backgroundColor: "#fff",
                padding: { x: 6, y: 4 },
            })
            .setOrigin(0.5);

        // 3 sekunnin päästä jatkuu
        this.scene.time.delayedCall(3000, () => {
            text.destroy();
            player.state = "can_move";
            if (onComplete) onComplete();
        });
    }
}

