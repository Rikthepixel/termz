export function outlinedBox(columns: number, rows: number) {
    return Array(rows)
        .fill(1)
        .map((_, y) => {
            if (y === 0) {
                return `╭${"─".repeat(columns - 2)}╮`;
            }

            if (y === rows - 1) {
                return `╰${"─".repeat(columns - 2)}╯`;
            }

            return `│${" ".repeat(columns - 2)}│`;
        })
        .flat()
        .join("\n");
}
