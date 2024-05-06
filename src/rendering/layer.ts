export function stack(layers: string[]) {
    let base = "";
    let maxRows = 0;
    for (const [, layer] of layers.entries()) {
        const rows = layer.split("\n").length;
        maxRows = Math.max(rows, maxRows);
        base = `${base}${layer}${`\u001B[${rows}A`}`;
    }
    base += `\u001B[${maxRows}B`;
    return base;
}
