export function calculateDifficulty(enemies, playerLevel) {
    const total = enemies.reduce((sum, e) => sum + (e.level || 1), 0);
    const avg = total / enemies.length;
    const factor = 1 + ((enemies.length - 1) * 0.3);
    const relative = (avg * factor) / (playerLevel || 1);

    if (relative < 0.8) return { label: "Easy", color: "#00ff00" };
    if (relative < 1.2) return { label: "Moderate", color: "#ffff00" };
    if (relative < 1.8) return { label: "Challenging", color: "#ff9900" };
    return { label: "Dangerous", color: "#ff0000" };
}
