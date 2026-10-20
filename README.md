# Charlie: Battle for Sockford
**DynomiteHero Studio — Lead Programmer Documentation**

*Charlie: Battle for Sockford* is a colourful 16-bit platform adventure starring **Charlie**, the brown cocker spaniel (known affectionately as the *Prince of Princes*!).

---

## 1. Technical Assessment

### Repository Initial Assessment
- **Status at Initialization:** The repository initially contained incomplete HTML fragments from a personal blog rather than game source code. Neither compiled Genesis/Mega Drive ROM binaries (`.bin`) nor SGDK source files were present in the initial commit.
- **Toolchain Status:** The execution environment lacks `m68k-elf-gcc` and standard SGDK environment variables (`$MARSDEV`). However, native SGDK-compatible C source files (`src/main.c`, `res/resources.res`, `Makefile`) have been established to allow immediate native ROM compilation on any system with SGDK installed.
- **Browser Edition Engine:** To provide an immediate, authentic playable build, a dedicated HTML5/Canvas retro game engine was built using strict 4:3 aspect ratio presentation (320x240 native internal resolution, scaled cleanly).

---

## 2. Gameplay Features & Mechanics

- **Bark Blast:** Ranged/AOE projectile attack emitted by Charlie to stun or defeat enemies.
- **Zoomies Dash:** High-speed invulnerable dash allowing Charlie to cross wide gaps and burst through obstacles.
- **Collectibles:**
  - 🧦 **Socks:** Primary collectible; collecting 100 grants an extra life.
  - 🦴 **Bones:** Restores health / unlocks secret upgrades.
- **Stages & Mechanics:**
  - Platforming stages with secret paths, checkpoints, and saved progress.
  - Boss encounters.
  - *Sky of Sockford* flying stage.
  - Unlockable costumes and difficulty settings (Normal & Hard Mode).

---

## 3. Controls & Target Platforms

### Sega Mega Drive / Genesis (3-Button / 6-Button Pad)
- **D-Pad Left/Right:** Move Charlie
- **Button A:** Bark Blast Attack
- **Button B:** Jump
- **Button C:** Zoomies Dash
- **Start:** Pause / Options

### Browser Edition (PC / Mobile / Gamepad)
- **Arrow Keys / WASD / On-screen D-Pad:** Move Left / Right / Crouch / Look Up
- **Key Z / Key J / Touch 'A':** Bark Blast
- **Key X / Key K / Touch 'B':** Jump
- **Key C / Key L / Touch 'C':** Zoomies Dash
- **Gamepad:** Full Standard USB / Bluetooth Gamepad Support

---

## 4. Specialist Task Delegation (AI Team Roles)

To ensure high quality, technical programming is separated from visual, audio, and design tasks:

1. **Pixel Artist Specialist:**
   - Sprite sheets for Charlie (Idle, Walk, Run, Jump, Bark Blast, Zoomies Dash, Damage, House costumes).
   - Tilemaps for Stage 1 (Sockford Gardens), Stage 2 (Sky of Sockford), and Boss Sprites.
2. **Music Designer Specialist:**
   - 16-bit FM Synthesizer / VGM music tracks for Stage Theme, Boss Theme, and Title Screen.
   - PSG sound effects for Bark Blast, sock pickup, jump, and hurt events.
3. **Level Designer Specialist:**
   - Stage layouts (320x224 tile coordinates) with enemy placement, secret sock stash locations, and checkpoint markers.
4. **Game Tester Specialist:**
   - Collision edge-case reports, frame timing analysis, and difficulty tuning feedback on Hard Mode.

---

## 5. Build Instructions

### SGDK Native ROM
```bash
# Requires SGDK (Sega Genesis Development Kit) with MARSDEV / m68k-elf-gcc
make -f Makefile
```

### Browser Edition
Open `index.html` in any modern web browser or run a local static web server.
