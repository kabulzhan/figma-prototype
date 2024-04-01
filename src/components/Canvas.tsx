import { useEffect, useRef } from "react";
import {
  initializeFabric,
  handleResize,
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
  deleteShapeFromStorage: (objectId: any) => void;
  isDrawing: React.MutableRefObject<boolean>;
  syncShapeInStorage: (object: any) => void;
  isEditingRef: React.MutableRefObject<boolean>;
  setElementAttributes: React.Dispatch<React.SetStateAction<Attributes>>;
  activeObjectRef: React.MutableRefObject<fabric.Object | null>;
  undo: () => void;
  redo: () => void;
};

const Canvas = ({
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
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const canvasObjects = useStorage((root) => root.canvasObjects);

  useEffect(() => {
    if (fabricRef.current) return;

    const canvas = initializeFabric({ canvasRef, fabricRef });
    console.log("fabric initialized", canvas);
    if (!canvas) return;
    canvas.on("mouse:down", (options) => {
      handleCanvasMouseDown({ options, canvas, isDrawing, shapeRef, selectedShapeRef });
    });

    canvas.on("mouse:move", (options) => {
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
      handleCanvasMouseUp({
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement,
        activeObjectRef,
      });
    });

    canvas.on("object:modified", (options) => {
      handleCanvasObjectModified({ options, syncShapeInStorage });
    });

    canvas.on("selection:created", (options) => {
      handleCanvasSelectionCreated({ options, isEditingRef, setElementAttributes });
    });

    canvas.on("object:scaling", (options: any) =>
      handleCanvasObjectScaling({ options, setElementAttributes }),
    );

    canvas.on("path:created", (options) => handlePathCreated({ options, syncShapeInStorage }));

    window.addEventListener("resize", () => handleResize({ canvas: fabricRef.current }));

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

    // return () => {
    //   if (canvas) canvas.dispose();
    // };
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
  ]);

  useEffect(() => {
    renderCanvas({ fabricRef, canvasObjects, activeObjectRef });
  }, [canvasObjects]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
};

export default Canvas;
