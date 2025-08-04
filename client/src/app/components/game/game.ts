import { Component, ElementRef, Input, Renderer2, signal, ViewChild } from '@angular/core';
import { GameActions, GameState } from '../../game/game';
import { Player } from '../../game/player';
import { NgStyle } from '@angular/common';

class Cursor {
	name: string = "";
	el: HTMLElement = null as any;
	isDown: boolean = false;
}

@Component({
	selector: 'app-game',
	imports: [NgStyle],
	templateUrl: './game.html',
	styleUrl: './game.less'
})
export class Game {
	@Input() game: GameState;
	@Input() actions: GameActions;
	@ViewChild('cursor') cursorRef!: ElementRef<HTMLDivElement>;
	@ViewChild('boardContainer') boardContainer!: ElementRef<HTMLDivElement>;

	Math = Math;
	curCursor = signal<Cursor>(new Cursor);
	selectedElement: HTMLElement | null = null;
	playerPosHash: { [_: string]: Player } = {};

	constructor(private renderer: Renderer2) {
		this.game = new GameState;
		this.actions = this.game;
	}

	projectCoordToMoveCellId(rIdx: number, cIdx: number) {
		return this.toId(Math.floor(rIdx / 2), Math.floor(cIdx / 2));
	}

	ngOnInit() {
		const hash: { [_: string]: Player } = {};

		for (const player of this.game.players) {
			hash[this.toId(player.y, player.x)] = player;
		}

		this.playerPosHash = hash;
	}

	getWidthHeightFromEl(el: HTMLElement) {
		const { width: widthStr, height: heightStr } = getComputedStyle(el);
		const height = Number(heightStr.slice(0, -2));
		const width = Number(widthStr.slice(0, -2));

		return { width, height };
	}

	setCursorYX(y: number, x: number) {
		const cursorEl = this.cursorRef.nativeElement;
		cursorEl.style.left = `${x}px`;
		cursorEl.style.top = `${y}px`;
	}

	placeCursorOnMouse(e: PointerEvent, el: ElementRef) {
		const board = this.boardContainer.nativeElement;
		const { width, height } = this.getWidthHeightFromEl(el.nativeElement);

		const x = e.x - board.offsetLeft - (width / 2);
		const y = e.y - board.offsetTop - (height / 2);

		this.setCursorYX(y, x);
	}

	setCursor(name: string, el: HTMLElement, isDown: boolean) {
		this.renderer.setProperty(this.cursorRef.nativeElement, "innerHTML", "");
		this.renderer.appendChild(this.cursorRef.nativeElement, el);
		this.curCursor.set({ name, el, isDown });
		this.showCursor();
	}

	hideCursor() {
		const cursorEl = this.cursorRef.nativeElement;
		cursorEl.style.display = "none";
	}

	showCursor() {
		if(this.curCursor().isDown) {
			const cursorEl = this.cursorRef.nativeElement;
			cursorEl.style.display = "block";
		}
	}

	setCursorElId(id: string) {
		const cur = this.curCursor()
		cur.el.id = id;
	}

	toId(rIdx: number, cIdx: number, prefix: string = "") {
		return `${prefix}i${rIdx}_${cIdx}`;
	}

	idToIdx(str: string) {
		const o = str.replace("i", "").split("_").map(Number);
		return { r: o[0], c: o[1] };
	}

	onPointerDown(e: PointerEvent) {
		const target = e.target as HTMLElement | null;

		const selected = this.selectedElement;

		if(selected) {
			selected.classList.remove("focused");
			this.selectedElement = null;
		}

		if(!target) return;

		if(target.classList.contains("plank")) {
			document.body.style.cursor = "grabbing";
			this.setCursor("plank", target.cloneNode() as HTMLElement, true);
			this.selectedElement = target;
			this.setCursorElId("plank-cursor-vertical");
			target.classList.add("selected", "focused");
		} else if(target.classList.contains("player")) {
			document.body.style.cursor = "grabbing";
			this.setCursor("player", target.cloneNode() as HTMLElement, true);
			this.selectedElement = target;
			target.classList.add("selected", "focused");
		}
		this.placeCursorOnMouse(e, this.cursorRef);
	}

	onPointerUp(_e: PointerEvent) {
		document.body.style.cursor = "default";
		this.hideCursor();
		const cur = this.curCursor();
		this.setCursor(cur.name, cur.el, false);
		this.selectedElement?.classList.remove("selected");
	}

	handlePlankMove(e: PointerEvent, target: HTMLElement) {
		const cur = this.curCursor();
		const { width: targetWidth, height: targetHeight } = this.getWidthHeightFromEl(target);
		const board = this.boardContainer.nativeElement;
		const x = e.x - target.offsetLeft - board.offsetLeft;
		const y = e.y - target.offsetTop - board.offsetTop;
		const { r, c } = this.idToIdx(target.id);

		if(target.classList.contains("horizontal")) {
			cur.el.id = "plank-cursor-horizontal";

			if(x < targetWidth / 2) { // less than
				const element = board.querySelector(
					this.toId(r, Math.max(c - 2, 0), "#")
				) as HTMLElement;

				this.setCursorYX(element.offsetTop, element.offsetLeft);
			} else { // greater than
				if(c >= this.game.board.board.length - 1) {
					const element = board.querySelector(
						this.toId(r, Math.max(c - 2, 0), "#")
					) as HTMLElement;
					this.setCursorYX(element.offsetTop, element.offsetLeft);
				} else {
					this.setCursorYX(target.offsetTop, target.offsetLeft);
				}
			}
		} else if(target.classList.contains("vertical")) {
			cur.el.id = "plank-cursor-vertical";

			if(y < targetHeight / 2) { // less than
				const element = board.querySelector(
					this.toId(Math.max(r - 2, 0), c, "#")
				) as HTMLElement;
				this.setCursorYX(element.offsetTop, element.offsetLeft);
			} else { // greater than
				if(r >= this.game.board.board.length - 1) {
					const element = board.querySelector(
						this.toId(Math.max(r - 2, 0), c, "#")
					) as HTMLElement;
					this.setCursorYX(element.offsetTop, element.offsetLeft);
				} else {
					this.setCursorYX(target.offsetTop, target.offsetLeft);
				}
			}
		} else {
			if(cur.el.id === "plank-cursor-horizontal") {
				const element = board.querySelector(
					this.toId(r, Math.max(c - 1, 0), "#")
				) as HTMLElement;
				this.setCursorYX(element.offsetTop, element.offsetLeft);
			} else {
				const element = board.querySelector(
					this.toId(Math.max(r - 1, 0), c, "#")
				) as HTMLElement;
				this.setCursorYX(element.offsetTop, element.offsetLeft);
			}
		}
	}

	onPointerMove(e: PointerEvent) {
		if(this.curCursor().el !== null) {
			this.placeCursorOnMouse(e, this.cursorRef);
		}

		const target = e.target as HTMLElement | null;
		const cur = this.curCursor();
		if(!target || cur.el === null) return;

		if(target.classList.contains("plank-cell")) {
			this.handlePlankMove(e, target);
		}
	}

	onPointerEnter(_e: PointerEvent) {
		this.showCursor();
	}

	onPointerLeave(_e: PointerEvent) {
		this.hideCursor();
	}
}
