import { fabric } from "fabric";

import { memo, useEffect, useRef } from "react";
import {
  initializeFabric,
  // handleResize,
  handleCanvasMouseDown,
  handleCanvaseMouseMove,
  handleCanvasMouseUp,
  renderCanvas,
  handleCanvasObjectModified,
  handleCanvasSelectionCreated,
  handleCanvasObjectScaling,
  handlePathCreated,
} from "@/lib/canvas";
import { useStorage } from "#root/liveblocks.config";
import { ActiveElement, Attributes } from "@/types/type";
import { handleKeyDown } from "@/lib/key-events";
import { useAtom, useSetAtom } from "jotai";
import { canvasAtom, selectionAtom } from "@/state/atoms";

type CanvasProps = {
  shapeRef: React.MutableRefObject<fabric.Object | null>;
  selectedShapeRef: React.MutableRefObject<string | null>;
  setActiveElement: React.Dispatch<React.SetStateAction<ActiveElement>>;
  // fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  deleteShapeFromStorage: (objectId: string) => void;
  isDrawing: React.MutableRefObject<boolean>;
  syncShapeInStorage: (object: fabric.Object) => void;
  isEditingRef: React.MutableRefObject<boolean>;
  setElementAttributes: React.Dispatch<React.SetStateAction<Attributes>>;
  activeObjectRef: React.MutableRefObject<fabric.Object | null>;
  undo: () => void;
  redo: () => void;
  updateCursorType: (activeElemParam?: string) => void;
};

const MAX_SCALE = 2;
const MIN_SCALE = 0.5;

interface IExtendedCanvas extends fabric.Canvas {
  isDragging: boolean;
}

const CanvasFC = ({
  shapeRef,
  selectedShapeRef,
  setActiveElement,
  // fabricRef,
  deleteShapeFromStorage,
  isDrawing,
  syncShapeInStorage,
  isEditingRef,
  setElementAttributes,
  activeObjectRef,
  undo,
  redo,
  updateCursorType,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useAtom(canvasAtom);
  const setSelectionAtom = useSetAtom(selectionAtom);

  const canvasObjects = useStorage((root) => root.canvasObjects);

  const isCanvasInitialized = useRef(false);

  useEffect(() => {
    // if (fabricRef.current) return;
    if (isCanvasInitialized.current) return;
    // if (canvas) return;

    const canvasInit = initializeFabric({ canvasRef }) as IExtendedCanvas;
    if (!canvasInit) return;
    isCanvasInitialized.current = true;
    setCanvas(canvasInit);

    canvasInit.on("mouse:down", (options) => {
      canvasInit.isDragging = true;
      if (selectedShapeRef.current === "hand") updateCursorType("grabbing");
      if (!canvasInit.selection) return;
      handleCanvasMouseDown({ options, canvas: canvasInit, isDrawing, shapeRef, selectedShapeRef });
    });

    canvasInit.on("mouse:move", (options) => {
      if (!canvasInit.selection) return;
      handleCanvaseMouseMove({
        options,
        canvas: canvasInit,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
      });
    });

    canvasInit.on("mouse:up", () => {
      canvasInit.isDragging = false;
      if (selectedShapeRef.current === "hand") updateCursorType("hand");
      handleCanvasMouseUp({
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
      });
    });

    canvasInit.on("object:modified", (options) => {
      if (!canvasInit.selection) return;
      handleCanvasObjectModified({ options, syncShapeInStorage });
    });

    canvasInit.on("selection:created", (options) => {
      setSelectionAtom(options);
      handleCanvasSelectionCreated({ options, isEditingRef, setElementAttributes });
    });

    canvasInit.on("object:scaling", (options) =>
      handleCanvasObjectScaling({ options, setElementAttributes }),
    );

    canvasInit.on("path:created", (options) => handlePathCreated({ options, syncShapeInStorage }));

    canvasInit.on("mouse:wheel", function (opt) {
      let zoom = canvasInit.getZoom();
      zoom *= 0.999 ** opt.e.deltaY;
      if (zoom > MAX_SCALE) zoom = MAX_SCALE;
      if (zoom < MIN_SCALE) zoom = MIN_SCALE;

      canvasInit.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    canvasInit.on("mouse:move", function (event) {
      if (canvasInit.isDragging && selectedShapeRef.current === "hand") {
        const mEvent = event.e;
        const delta = new fabric.Point(mEvent.movementX, mEvent.movementY);
        canvasInit.relativePan(delta);
      }
    });

    // window.addEventListener("resize", () => handleResize({ canvas: fabricRef.current }));

    window.addEventListener("keydown", (e): void => {
      handleKeyDown({
        e,
        canvas: canvasInit,
        undo,
        redo,
        syncShapeInStorage,
        deleteShapeFromStorage,
      });
    });
  }, [
    selectedShapeRef,
    // fabricRef,
    setActiveElement,
    undo,
    redo,
    activeObjectRef,
    isDrawing,
    shapeRef,
    syncShapeInStorage,
    isEditingRef,
    setElementAttributes,
    deleteShapeFromStorage,
    updateCursorType,
    canvas,
    setCanvas,
    setSelectionAtom,
  ]);

  useEffect(() => {
    if (!canvas) return;
    renderCanvas({ canvas, canvasObjects, activeObjectRef });
  }, [canvasObjects, canvas]);

  console.log("CANVAS");
  return <canvas ref={canvasRef} className="h-full w-full" />;
};

const Canvas = memo(CanvasFC);

export default Canvas;
