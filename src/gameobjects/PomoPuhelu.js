export class PomoPuhelu {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.messages = [
            "Hei, voitko nopeasti vilkaista sen PowerPointin?",
            "Mulla on se esitys 15 minuutin päästä.",
            "Voitko lähettää mulle sen nyt?",
        ];

        this.currentIndex = 0;
        this.dialogBox = null;
        this.avatar = null;

        this.start();
    }

    start() {
        this.player.state = "stunned";

        // Piirrä pomo-siluetti (placeholder neliö)
        this.avatar = this.scene.add
            .rectangle(
                this.scene.scale.width / 2,
                this.scene.scale.height - 100,
                80,
                80,
                0x333333
            )
            .setScrollFactor(0);

        this.dialogBox = this.scene.add
            .text(
                this.scene.scale.width / 2,
                this.scene.scale.height - 160,
                "",
                {
                    font: "18px Arial",
                    fill: "#fff",
                    backgroundColor: "#000",
                    padding: { x: 8, y: 6 },
                    wordWrap: { width: 300 },
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0);

        this.showNextMessage();
    }

    showNextMessage() {
        if (this.currentIndex >= this.messages.length) {
            this.end();
            return;
        }

        this.dialogBox.setText(this.messages[this.currentIndex]);
        this.currentIndex++;

        // Seuraava repliikki 2 sekunnin päästä
        this.scene.time.delayedCall(2000, () => {
            this.showNextMessage();
        });
    }

    end() {
        this.dialogBox.destroy();
        this.avatar.destroy();
        this.player.state = "can_move";
    }
}

