import Navbar from "@/components/Navbar";
import LeftSidebar from "./components/LeftSidebar";
import Live from "./components/Live";
import RightSidebar from "./components/RightSidebar";
import { useState, useRef, ChangeEvent } from "react";
import { ActiveElement, Attributes } from "./types/type";
import { useMutation, useStorage, useUndo, useRedo } from "#root/liveblocks.config";
import { defaultNavElement } from "./constants";
import { handleDelete } from "./lib/key-events";
import { handleImageUpload } from "./lib/shapes";

function App() {
  const fabricRef = useRef<fabric.Canvas>(null);
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
    fontSize: "",
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
    console.log("%c [ objectId ]-52", "font-size:13px; background:#ccc; color:blue;", objectId);
    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.delete(objectId);
  }, []);

  const handleActiveElement = (elem: ActiveElement) => {
    setActiveElement(elem);

    switch (elem?.value) {
      case "reset":
        deleteAllShapes();
        fabricRef.current?.clear();
        setActiveElement(defaultNavElement);
        break;

      case "delete":
        handleDelete(fabricRef.current as fabric.Canvas, deleteShapeFromStorage);
        setActiveElement(defaultNavElement);
        break;

      case "image":
        imageInputRef.current?.click();
        isDrawing.current = false;

        if (fabricRef.current) {
          fabricRef.current.isDrawingMode = false;
        }
        break;

      default:
        break;
    }

    selectedShapeRef.current = elem?.value as string;
  };

  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;
    const { objectId } = object;

    const shapeData = object.toJSON();
    shapeData.objectId = objectId;

    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.set(objectId, shapeData);
  }, []);

  return (
    <main className="h-screen overflow-hidden">
      <Navbar
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
        imageInputRef={imageInputRef}
        handleImageUpload={(e: ChangeEvent<HTMLInputElement>) => {
          e.stopPropagation();
          if (e.target.files?.[0]) {
            handleImageUpload({
              file: e.target.files[0],
              canvas: fabricRef,
              shapeRef,
              syncShapeInStorage,
            });
          }
        }}
      />
      <section className="flex h-full flex-row">
        <LeftSidebar allShapes={Array.from(canvasObjects)} />
        <Live
          shapeRef={shapeRef}
          selectedShapeRef={selectedShapeRef}
          setActiveElement={setActiveElement}
          fabricRef={fabricRef}
          deleteShapeFromStorage={deleteShapeFromStorage}
          isDrawing={isDrawing}
          syncShapeInStorage={syncShapeInStorage}
          isEditingRef={isEditingRef}
          setElementAttributes={setElementAttributes}
          activeObjectRef={activeObjectRef}
          undo={undo}
          redo={redo}
        />
        <RightSidebar
          elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes}
          fabricRef={fabricRef}
          isEditingRef={isEditingRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
        />
      </section>
    </main>
  );
}

export default App;
