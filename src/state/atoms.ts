import { atom } from "jotai";
import type { fabric } from "fabric";

export const canvasAtom = atom<fabric.Canvas | null>(null);

export const selectionAtom = atom<fabric.IEvent<MouseEvent> | null>(null);
