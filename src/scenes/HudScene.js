import { Scene } from "phaser";

export class HudScene extends Scene {
    currentDay = 1;
    maxDays = 21;
    graduProgress = 0;
    remainingTime = 0;

    dayText;
    graduText;
    tukiText;
    timeText;

    constructor() {
        super("HudScene");
    }

    init(data) {
        this.currentDay = data.currentDay;
        this.maxDays = data.maxDays;
        this.graduProgress = data.graduProgress;
        this.remainingTime = data.remainingTime;
    }

    create() {
        const padding = 10;

        this.graduText = this.add.bitmapText(padding, 10, "pixelfont", "", 24);
        this.tukiText = this.add.bitmapText(padding, 40, "pixelfont", "", 24);
        this.timeText = this.add
            .bitmapText(this.scale.width - padding, 10, "pixelfont", "", 24)
            .setOrigin(1, 0);

        this.updateAll();
    }

    updateAll() {
        this.graduText.setText(`GRADU ${this.graduProgress}%`);
        const tukikuukaudet = this.maxDays - this.currentDay + 1;
        this.tukiText.setText(`TUKIKUUKAUSIA ${tukikuukaudet}`);
        this.updateTime(this.remainingTime);
    }

    updateTime(secondsLeft) {
        this.remainingTime = secondsLeft;
        if (!this.timeText) return; // ← estää virheen jos ei vielä luotu

        const min = Math.floor(secondsLeft / 60)
            .toString()
            .padStart(1, "0");
        const sec = Math.floor(secondsLeft % 60)
            .toString()
            .padStart(2, "0");
        this.timeText.setText(`AIKAA ${min}:${sec}`);
    }

    // Näitä voi käyttää MainScene:stä
    setDay(day) {
        this.currentDay = day;
        this.updateAll();
    }

    setGradu(progress) {
        this.graduProgress = progress;
        this.updateAll();
    }
}

