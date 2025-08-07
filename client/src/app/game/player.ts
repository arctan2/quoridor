export class PlankSlots {
	slots: boolean[];

	constructor(slotsCount: number) {
		this.slots = new Array<boolean>(slotsCount).fill(true, 0, slotsCount);
	}

	removePlank(idx: number) {
		this.slots[idx] = false;
	}
}

export class Coord {
	x: number;
	y: number;

	constructor(y: number = -1, x: number = -1) {
		this.y = y;
		this.x = x;
	}
}

export class Player extends Coord {
	name: string;
	color: string;
	plankSlots: PlankSlots;

	start: Coord = new Coord();
	end: Coord = new Coord();

	constructor(name: string = "player", color: string = "#000000", plankSlotsCount: number = 9) {
		super();
		this.name = name;
		this.color = color;
		this.plankSlots = new PlankSlots(plankSlotsCount);
	}

	setStart(y: number, x: number, boardLen: number) {
		this.y = y;
		this.x = x;

		this.start.x = x;
		this.start.y = y;

		const half = Math.floor(boardLen / 2);

		if(x === half) {
			if(y === 0) this.end.y = boardLen - 1;
			else this.end.y = 0;
		} else {
			if(x === 0) this.end.x = boardLen - 1;
			else this.end.x = 0;
		}
	}
}

export const Colors = ["#00ff00", "#ff0000", "#ffff00", "#0000ff"];
