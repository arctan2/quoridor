import { Component, ElementRef, HostListener, inject, Input, Renderer2, signal, ViewChild, WritableSignal } from '@angular/core';
import { GameActions, GameState } from '../../game/game';
import { Player } from '../../game/player';
import { NgClass, NgStyle } from '@angular/common';
import { Entity, Orient } from '../../game/board';
import { Router } from '@angular/router';

class Cursor {
	name: string = "";
	el: HTMLElement = null as any;
	isDown: boolean = false;
}

@Component({
	selector: 'app-game',
	imports: [NgStyle, NgClass],
	templateUrl: './game.html',
	styleUrl: './game.less'
})
export class Game {
	@Input() game: GameState;
	@Input() actions: GameActions;
	@ViewChild('cursor') cursorRef!: ElementRef<HTMLDivElement>;
	@ViewChild('boardContainer') boardContainer!: ElementRef<HTMLDivElement>;
	private router = inject(Router);

	Math = Math;
	Entity = Entity;
	curCursor = signal<Cursor>(new Cursor);
	selectedElement: HTMLElement | null = null;
	playerPosHash: WritableSignal<{ [_: string]: Player }> = signal({});
	possibleMoves: WritableSignal<Set<string>> = signal(new Set);

	constructor(private renderer: Renderer2) {
		this.game = new GameState;
		this.actions = this.game;
	}

	goToHome() {
		this.router.navigate([''], { replaceUrl: true });
	}

	ngOnInit() {
		this.updatePlayerPosHash();
	}

	updatePlayerPosHash() {
		const hash: { [_: string]: Player } = {};

		for (const player of this.game.players) {
			hash[this.toId(player.y, player.x)] = player;
		}

		this.playerPosHash.set(hash);
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
		if (!el) return;
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
		if (this.curCursor().isDown) {
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

	updatePossibleMoves() {
		if (this.selectedElement === null) {
			return;
		}
		const { r, c } = this.idToIdx(this.selectedElement.id);

		let s = new Set<string>;

		for (const p of this.game.possibleMoves(r, c)) {
			s.add(this.toId(p.y, p.x))
		}

		this.possibleMoves.set(s);
	}

	onPointerDown(e: PointerEvent) {
		const target = e.target as HTMLElement | null;

		const selected = this.selectedElement;


		if (selected) {
			if (target && selected.classList.contains("player") && this.handlePlayerUp(e, target)) {
				return;
			}

			selected.classList.remove("focused");
			this.selectedElement = null;
		}
		this.possibleMoves.set(new Set);

		if (!target) return;

		if (target.classList.contains("plank")) {
			document.body.style.cursor = "grabbing";
			this.setCursor("plank", target.cloneNode() as HTMLElement, true);
			this.selectedElement = target;
			this.setCursorElId("plank-cursor-vertical");
			target.classList.add("selected", "focused");
		} else if (target.classList.contains("player")) {
			document.body.style.cursor = "grabbing";
			this.setCursor("player", target.cloneNode() as HTMLElement, true);
			this.selectedElement = target;
			target.classList.add("selected", "focused");
			this.updatePossibleMoves();
		}
		this.placeCursorOnMouse(e, this.cursorRef);
	}

	getFinalRowColOrient(e: PointerEvent, target: HTMLElement) {
		const cur = this.curCursor();
		const { width: targetWidth, height: targetHeight } = this.getWidthHeightFromEl(target);
		const board = this.boardContainer.nativeElement;
		const x = e.x - target.offsetLeft - board.offsetLeft;
		const y = e.y - target.offsetTop - board.offsetTop;
		const { r, c } = this.idToIdx(target.id);

		let finalRow = r;
		let finalCol = c;
		let orient: Orient;

		if (target.classList.contains("horizontal")) {
			cur.el.id = "plank-cursor-horizontal";
			if ((x < targetWidth / 2) || (c >= this.game.board.board.length - 1)) {
				finalCol = Math.max(c - 2, 0);
			}
			orient = Orient.H;
		} else if (target.classList.contains("vertical")) {
			cur.el.id = "plank-cursor-vertical";
			if ((y < targetHeight / 2) || (r >= this.game.board.board.length - 1)) {
				finalRow = Math.max(r - 2, 0);
			}
			orient = Orient.V;
		} else {
			if (cur.el.id === "plank-cursor-horizontal") {
				finalCol = Math.max(c - 1, 0);
				orient = Orient.H;
			} else {
				finalRow = Math.max(r - 1, 0);
				orient = Orient.V;
			}
		}

		return { finalRow, finalCol, orient };
	}

	handlePlankMove(e: PointerEvent, target: HTMLElement) {
		const cursor = this.curCursor().el;
		const board = this.boardContainer.nativeElement;

		const { finalRow, finalCol, orient } = this.getFinalRowColOrient(e, target);

		const element = board.querySelector(this.toId(finalRow, finalCol, "#")) as HTMLElement;

		this.setCursorYX(element.offsetTop, element.offsetLeft);

		if (!this.actions.canPlacePlank(finalRow, finalCol, orient)) {
			cursor.classList.add("invalid");
		}
	}

	handlePlankUp(e: PointerEvent, target: HTMLElement) {
		const { finalRow, finalCol, orient } = this.getFinalRowColOrient(e, target);
		if (this.actions.canPlacePlank(finalRow, finalCol, orient)) {
			this.actions.placePlankOfPlayer(this.game.players[this.game.curPlayerIdx()].id, finalRow, finalCol, orient);
			this.actions.changeTurn();
		}
	}

	handlePlayerUp(_e: PointerEvent, target: HTMLElement) {
		if (this.possibleMoves().has(target.id)) {
			const { r, c } = this.idToIdx(target.id);
			this.actions.movePlayerById(this.game.players[this.game.curPlayerIdx()].id, r, c);
			this.updatePlayerPosHash();
			this.possibleMoves.set(new Set);
			this.actions.changeTurn();
			this.game.checkIsGameOver();
			return true;
		}

		return false;
	}

	@HostListener("document:pointerup", ["$event"])
	onPointerUp(e: PointerEvent) {
		document.body.style.cursor = "default";
		this.hideCursor();
		const cur = this.curCursor();
		this.setCursor(cur.name, cur.el, false);
		this.selectedElement?.classList.remove("selected");

		const target = e.target as HTMLElement | null;
		if (!target) return;

		if (this.selectedElement === null) return;
		const classList = this.selectedElement.classList;

		if (classList.contains("plank")) {
			this.handlePlankUp(e, target);
		} else if (classList.contains("player")) {
			this.handlePlayerUp(e, target);
		}
	}

	onPointerMove(e: PointerEvent) {
		if (this.curCursor().el !== null) {
			this.placeCursorOnMouse(e, this.cursorRef);
		}

		const target = e.target as HTMLElement | null;
		const cur = this.curCursor();
		if (!target || cur.el === null || !cur.isDown) return;

		if (cur.el.classList.contains("plank")) {
			cur.el.classList.remove("invalid");
		}

		if (target.classList.contains("plank-cell") && cur.el.classList.contains("plank")) {
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
