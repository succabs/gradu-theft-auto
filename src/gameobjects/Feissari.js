import Phaser, { GameObjects, Physics } from "phaser";

export class Feissari extends Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "feissari");
        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setDisplaySize(64, 64);
        this.body.setSize(64, 64, true);
        this.body.setSize(70, 70, true);
        this.setImmovable(true);
        this.triggered = false;
        this.speed = 0;
        this.direction = 1;
        this.patrolMinX = null;
        this.patrolMaxX = null;
    }

    reset() {
        this.triggered = false;
        this.speed = 0;
        this.direction = 1;
        this.setVelocity(0);
    }

    trigger(player, onComplete) {
        if (this.triggered) return;
        this.triggered = true;

        // Pysäytä pelaaja
        player.state = "stunned";
        player.setVelocity(0);
        this.setVelocity(0);

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

    activateAt(x, y, patrolMinX, patrolMaxX) {
        this.setPosition(x, y);
        this.triggered = false;
        this.setActive(true);
        this.setVisible(true);
        if (this.body) {
            this.body.enable = true;
        }
        this.startPatrol(patrolMinX, patrolMaxX);
    }

    deactivate() {
        this.setActive(false);
        this.setVisible(false);
        if (this.body) {
            this.body.enable = false;
        }
        this.setVelocity(0);
    }

    startPatrol(minX, maxX) {
        this.patrolMinX = minX;
        this.patrolMaxX = maxX;
        const defaultSpeed = 60;
        const extra = Phaser.Math.Between(0, 30);
        this.speed = defaultSpeed + extra;
        this.direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
        this.setVelocityX(this.speed * this.direction);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (!this.body || !this.active) return;

        if (this.triggered) {
            this.setVelocityX(0);
            return;
        }

        if (this.patrolMinX === null || this.patrolMaxX === null) return;

        const halfWidth = Math.max(this.displayWidth, this.body.width || 0) / 2;
        const leftLimit = this.patrolMinX + halfWidth;
        const rightLimit = this.patrolMaxX - halfWidth;

        if (this.x <= leftLimit) {
            this.x = leftLimit;
            this.direction = 1;
            this.setVelocityX(this.speed);
        } else if (this.x >= rightLimit) {
            this.x = rightLimit;
            this.direction = -1;
            this.setVelocityX(-this.speed);
        }
    }
}

