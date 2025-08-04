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
		return `${Math.floor(rIdx / 2)}|${Math.floor(cIdx / 2)}`;
	}

	ngOnInit() {
		const hash: { [_: string]: Player } = {};

		for (const player of this.game.players) {
			hash[`${player.y}|${player.x}`] = player;
		}

		this.playerPosHash = hash;
	}

	getWidthHeightFromEl(el: ElementRef) {
		const { width: widthStr, height: heightStr } = getComputedStyle(el.nativeElement);
		const height = Number(heightStr.slice(0, -2));
		const width = Number(widthStr.slice(0, -2));

		return { width, height };
	}

	placeCursorOnMouse(e: PointerEvent, el: ElementRef) {
		const board = this.boardContainer.nativeElement;
		const cursorEl = el.nativeElement;
		const { width, height } = this.getWidthHeightFromEl(el);

		const x = e.x - board.offsetLeft - (width / 2);
		const y = e.y - board.offsetTop - (height / 2);

		cursorEl.style.left = `${x}px`;
		cursorEl.style.top = `${y}px`;
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

	onPointerMove(e: PointerEvent) {
		if(this.curCursor().el !== null) {
			this.placeCursorOnMouse(e, this.cursorRef);
		}
	}

	onPointerEnter(_e: PointerEvent) {
		this.showCursor();
	}

	onPointerLeave(_e: PointerEvent) {
		this.hideCursor();
	}
}
