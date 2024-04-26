import Navbar from "@/components/Navbar";
import LeftSidebar from "./components/LeftSidebar";
import Live from "./components/Live";
import RightSidebar from "./components/RightSidebar";
import { useState, useRef, ChangeEvent, useCallback } from "react";
import { ActiveElement, Attributes } from "./types/type";
import { useMutation, useStorage, useUndo, useRedo } from "#root/liveblocks.config";
import { defaultNavElement } from "./constants";
import { handleDelete } from "./lib/key-events";
import { handleImageUpload } from "./lib/shapes";
import { useAtomValue } from "jotai";
import { canvasAtom } from "./atoms/atoms";

function App() {
  const canvas = useAtomValue(canvasAtom);

  // const fabricRef = useRef<fabric.Canvas>(null);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const canvasObjects = useStorage((root) => root.canvasObjects);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isDrawing = useRef(false);
  const isEditingRef = useRef(false);
  const activeObjectRef = useRef<fabric.Object | null>(null);
  const undo = useUndo();
  const redo = useRedo();

  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: "",
    value: "",
    icon: "",
  });

  const [elementAttributes, setElementAttributes] = useState<Attributes>({
    width: "",
    height: "",
    fontSize: undefined,
    fontFamily: "",
    fontWeight: "",
    fill: "#aabbcc",
    stroke: "#aabbcc",
  });

  const deleteAllShapes = useMutation(({ storage }) => {
    const canvasObjects = storage.get("canvasObjects");

    if (!canvasObjects || canvasObjects.size === 0) return true;
    for (const [key] of canvasObjects.entries()) {
      canvasObjects.delete(key);
    }

    return canvasObjects.size === 0;
  }, []);

  const deleteShapeFromStorage = useMutation(({ storage }, objectId: string) => {
    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.delete(objectId);
  }, []);

  const updateCursorType = useCallback(
    (activeElemParam?: string) => {
      if (!canvas) return;
      const value = activeElemParam ?? activeElement?.value;

      switch (value) {
        case "hand":
          canvas.hoverCursor = "grab";
          canvas.defaultCursor = "grab";
          canvas.moveCursor = "grab";
          canvas.setCursor("grab");
          canvas.renderTop();
          break;

        case "grabbing":
          canvas.hoverCursor = "grabbing";
          canvas.defaultCursor = "grabbing";
          canvas.moveCursor = "grabbing";
          canvas.setCursor("grabbing");
          canvas.renderTop();
          break;

        default:
          if (canvas.hoverCursor !== "default") {
            canvas.hoverCursor = "default";
            canvas.defaultCursor = "default";
            canvas.setCursor("default");
            canvas.renderTop();
          }
          break;
      }
    },
    [activeElement, canvas],
  );

  const handleActiveElement = useCallback(
    (elem: ActiveElement) => {
      console.log("ATOM: ", canvas);

      if (!canvas) return;
      setActiveElement(elem);

      switch (elem?.value) {
        case "reset":
          deleteAllShapes();
          canvas.clear();
          setActiveElement(defaultNavElement);
          break;

        case "delete":
          handleDelete(canvas, deleteShapeFromStorage);
          setActiveElement(defaultNavElement);
          break;

        case "image":
          imageInputRef.current?.click();
          isDrawing.current = false;

          if (canvas) {
            canvas.isDrawingMode = false;
          }
          break;

        case "hand":
          canvas.selection = false;
          canvas.forEachObject(function (o) {
            o.selectable = false;
          });
          updateCursorType("hand");

          break;

        default:
          if (!canvas.selection) {
            updateCursorType("default");
            canvas.selection = true;
            canvas.forEachObject(function (o) {
              o.selectable = true;
            });
          }
          break;
      }

      selectedShapeRef.current = elem?.value as string;
    },
    [deleteAllShapes, deleteShapeFromStorage, updateCursorType, canvas],
  );

  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;
    const { objectId } = object;

    const shapeData = object.toJSON();
    shapeData.objectId = objectId;

    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.set(objectId, shapeData);
  }, []);
  console.log("APP");
  return (
    <main className="h-screen overflow-hidden">
      <Navbar
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
        imageInputRef={imageInputRef}
        handleImageUpload={(e: ChangeEvent<HTMLInputElement>) => {
          e.stopPropagation();
          if (!e.target.files?.[0] || !canvas) return;

          handleImageUpload({
            file: e.target.files[0],
            canvas,
            shapeRef,
            syncShapeInStorage,
          });
        }}
      />
      <section className="flex h-full flex-row">
        <LeftSidebar allShapes={Array.from(canvasObjects)} />
        <Live
          shapeRef={shapeRef}
          selectedShapeRef={selectedShapeRef}
          setActiveElement={setActiveElement}
          // fabricRef={fabricRef}
          deleteShapeFromStorage={deleteShapeFromStorage}
          isDrawing={isDrawing}
          syncShapeInStorage={syncShapeInStorage}
          isEditingRef={isEditingRef}
          setElementAttributes={setElementAttributes}
          activeObjectRef={activeObjectRef}
          undo={undo}
          redo={redo}
          updateCursorType={updateCursorType}
          handleActiveElement={handleActiveElement}
        />
        <RightSidebar
          elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes}
          canvas={canvas}
          isEditingRef={isEditingRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
        />
      </section>
    </main>
  );
}

export default App;
