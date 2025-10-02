# Gradu Theft Auto

## Introduction

Gradu Theft Auto is a top-down, time-management micro game about a student
trying to finish their master's thesis before study grants run out. Each day
you hustle along Kauppakatu toward the University library, juggling distractions
and time pressure while trying to reach 100 % thesis progress before the
21-month student allowance deadline expires.

## Technology

-   [Phaser 3](https://phaser.io/phaser3) powers all scenes, physics and HUD
    rendering.
-   [Vite](https://vitejs.dev/) provides the development/build tooling.
-   Bitmap fonts and lightweight placeholder sprites are loaded via Phaser's
    asset pipeline.

## How to play

1. Run the game and click anywhere on the title screen to start the day.
2. Use the arrow keys to move the student up and down the street.
3. Reach library at the top of the map before the daily timer
   expires to earn 5–15 % thesis progress.
4. Survive 21 in-game days and hit 100 % progress to win; run out of time and
   you'll see the game over screen.

## Encounters

-   **Feissari:** A street fundraiser who stops you for a quick chat, stunning
    you for three seconds before letting you go.
-   **Pomo:** Your boss calls as you approach the office block, playing a
    short dialogue sequence that freezes you in place until every line is
    delivered.
-   **Kaveri:** A friend invites you to a barbecue; accepting skips the
    remainder of the day and guarantees a sluggish start tomorrow.
-   **Library:** Make it to the library at the north end of town to get thesis
    progress and start the next day.

## Installation

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Start the development server with `npm run dev`.
4. If you want to build the project, run `npm run build`.

## Todo

-   graphics
-   randomize encounters

