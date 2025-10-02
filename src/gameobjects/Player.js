import { GameObjects, Physics } from "phaser";

export class Player extends Physics.Arcade.Image {
    // Player states: waiting, start, can_move
    state = "waiting";
    scene = null;

    constructor({ scene }) {
        super(scene, -190, 100, "player");
        this.scene = scene;
        this.slowNextDay = false;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
    }

    start() {
        this.state = "start";
        this.scene.cameras.main.startFollow(this);

        if (this.slowNextDay) {
            this.slowNextDay = false; // kulutetaan hidastus
            this.moveSpeed = 250;
        } else {
            this.moveSpeed = 550;
        }

        this.state = "can_move";
    }

    move(input) {
        if (this.state !== "can_move") return;

        const speed = this.moveSpeed || 550;

        this.setVelocity(0);

        if (input.up) {
            this.setVelocityY(-speed);
        }
        if (input.down) {
            this.setVelocityY(speed);
        }
        if (input.left) {
            this.setVelocityX(-speed);
        }
        if (input.right) {
            this.setVelocityX(speed);
        }
    }

    update() {}
}

