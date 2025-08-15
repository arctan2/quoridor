export function toId(rIdx: number, cIdx: number, prefix: string = "") {
	return `${prefix}i${rIdx}_${cIdx}`;
}

export function idToIdx(str: string) {
	// ya i know it doesn't handle prefix but it's not currently needed so i skip it
	const o = str.replace("i", "").split("_").map(Number);
	return { r: o[0], c: o[1] };
}

