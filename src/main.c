/*
 * Charlie: Battle for Sockford
 * Platform: Sega Mega Drive / Genesis
 * Studio: DynomiteHero
 * Lead Programmer: SGDK C Engine Implementation
 */

#include <genesis.h>

#define FIX32_GRAVITY FIX32(0.35)
#define FLOOR_Y FIX32(192)

typedef struct {
    fix32 x;
    fix32 y;
    fix32 vx;
    fix32 vy;
    u16 health;
    u16 socks;
    u16 bones;
    u16 lives;
    bool facingLeft;
    bool isGrounded;
    bool isDashing;
    u16 dashTimer;
    u16 barkCooldown;
} Player;

Player charlie;

static void initPlayer() {
    charlie.x = FIX32(40);
    charlie.y = FIX32(150);
    charlie.vx = FIX32(0);
    charlie.vy = FIX32(0);
    charlie.health = 4;
    charlie.socks = 0;
    charlie.bones = 0;
    charlie.lives = 3;
    charlie.facingLeft = FALSE;
    charlie.isGrounded = FALSE;
    charlie.isDashing = FALSE;
    charlie.dashTimer = 0;
    charlie.barkCooldown = 0;
}

static void handleInput() {
    u16 state = JOY_readJoypad(JOY_1);

    if (charlie.barkCooldown > 0) charlie.barkCooldown--;

    if (!charlie.isDashing) {
        if (state & BUTTON_LEFT) {
            charlie.vx = FIX32(-2.2);
            charlie.facingLeft = TRUE;
        } else if (state & BUTTON_RIGHT) {
            charlie.vx = FIX32(2.2);
            charlie.facingLeft = FALSE;
        } else {
            charlie.vx = fix32Mul(charlie.vx, FIX32(0.7));
        }

        if ((state & BUTTON_B) && charlie.isGrounded) {
            charlie.vy = FIX32(-6.8);
            charlie.isGrounded = FALSE;
        }
    }

    // Zoomies Dash (Button C)
    if ((state & BUTTON_C) && !charlie.isDashing && charlie.dashTimer == 0) {
        charlie.isDashing = TRUE;
        charlie.dashTimer = 20;
        charlie.vx = charlie.facingLeft ? FIX32(-5.5) : FIX32(5.5);
    }

    // Bark Blast (Button A)
    if ((state & BUTTON_A) && charlie.barkCooldown == 0) {
        charlie.barkCooldown = 18;
        // Spawn bark projectile in SGDK sprite manager
    }
}

static void updatePhysics() {
    if (charlie.dashTimer > 0) {
        charlie.dashTimer--;
        if (charlie.dashTimer == 0) charlie.isDashing = FALSE;
    }

    charlie.vy = fix32Add(charlie.vy, FIX32_GRAVITY);
    charlie.x = fix32Add(charlie.x, charlie.vx);
    charlie.y = fix32Add(charlie.y, charlie.vy);

    if (charlie.x < FIX32(0)) charlie.x = FIX32(0);
    if (charlie.x > FIX32(300)) charlie.x = FIX32(300);

    if (charlie.y >= FLOOR_Y) {
        charlie.y = FLOOR_Y;
        charlie.vy = FIX32(0);
        charlie.isGrounded = TRUE;
    }
}

static void drawHUD() {
    char str[32];
    sprintf(str, "SOCKS:%02d BONES:%02d LIVES:%d", charlie.socks, charlie.bones, charlie.lives);
    VDP_drawText("CHARLIE: BATTLE FOR SOCKFORD", 2, 1);
    VDP_drawText(str, 2, 2);
}

int main() {
    VDP_setScreenWidth320();
    SPR_init();

    initPlayer();

    while(1) {
        handleInput();
        updatePhysics();
        drawHUD();

        SPR_update();
        SYS_doVBlankProcess();
    }

    return 0;
}
