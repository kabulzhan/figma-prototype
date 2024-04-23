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

type CanvasProps = {
  shapeRef: React.MutableRefObject<fabric.Object | null>;
  selectedShapeRef: React.MutableRefObject<string | null>;
  setActiveElement: React.Dispatch<React.SetStateAction<ActiveElement>>;
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
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
  fabricRef,
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
  // const [isFabricInitialized, setIsFabricInitialized] = useState(false);

  const canvasObjects = useStorage((root) => root.canvasObjects);

  useEffect(() => {
    if (fabricRef.current) return;

    const canvas = initializeFabric({ canvasRef, fabricRef }) as IExtendedCanvas;
    if (!canvas) return;

    canvas.on("mouse:down", (options) => {
      canvas.isDragging = true;
      if (selectedShapeRef.current === "hand") updateCursorType("grabbing");
      if (!canvas.selection) return;
      handleCanvasMouseDown({ options, canvas, isDrawing, shapeRef, selectedShapeRef });
    });

    canvas.on("mouse:move", (options) => {
      if (!canvas.selection) return;
      handleCanvaseMouseMove({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
      });
    });

    canvas.on("mouse:up", () => {
      canvas.isDragging = false;
      if (selectedShapeRef.current === "hand") updateCursorType("hand");
      handleCanvasMouseUp({
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
      });
    });

    canvas.on("object:modified", (options) => {
      if (!canvas.selection) return;
      handleCanvasObjectModified({ options, syncShapeInStorage });
    });

    canvas.on("selection:created", (options) => {
      handleCanvasSelectionCreated({ options, isEditingRef, setElementAttributes });
    });

    canvas.on("object:scaling", (options) =>
      handleCanvasObjectScaling({ options, setElementAttributes }),
    );

    canvas.on("path:created", (options) => handlePathCreated({ options, syncShapeInStorage }));

    canvas.on("mouse:wheel", function (opt) {
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** opt.e.deltaY;
      if (zoom > MAX_SCALE) zoom = MAX_SCALE;
      if (zoom < MIN_SCALE) zoom = MIN_SCALE;

      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    canvas.on("mouse:move", function (event) {
      if (canvas.isDragging && selectedShapeRef.current === "hand") {
        const mEvent = event.e;
        const delta = new fabric.Point(mEvent.movementX, mEvent.movementY);
        canvas.relativePan(delta);
      }
    });

    // window.addEventListener("resize", () => handleResize({ canvas: fabricRef.current }));

    window.addEventListener("keydown", (e) => {
      handleKeyDown({
        e,
        canvas: fabricRef.current,
        undo,
        redo,
        syncShapeInStorage,
        deleteShapeFromStorage,
      });
    });
  }, [
    selectedShapeRef,
    fabricRef,
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
  ]);

  useEffect(() => {
    renderCanvas({ fabricRef, canvasObjects, activeObjectRef });
  }, [canvasObjects]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
};

const Canvas = memo(CanvasFC);

export default Canvas;
