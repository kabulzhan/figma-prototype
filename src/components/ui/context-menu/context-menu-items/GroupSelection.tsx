import { fabric } from "fabric";
import { useAtomValue } from "jotai";
import { canvasAtom, selectionAtom } from "@/state/atoms";

import { ContextMenuItem } from "../context-menu-components";
import { useCallback } from "react";

const GroupSelection = () => {
  const canvas = useAtomValue(canvasAtom);
  const selection = useAtomValue(selectionAtom);

  const groupItems = useCallback(() => {
    if (!canvas) return;

    const activeObject: fabric.Object | fabric.ActiveSelection | null = canvas.getActiveObject();

    if (!(activeObject instanceof fabric.ActiveSelection)) return;

    activeObject.toGroup();
    canvas.requestRenderAll();
  }, [canvas]);

  const ungroupItems = useCallback(() => {
    if (!canvas) return;
    const activeObject: fabric.Object | fabric.ActiveSelection | fabric.Group | null =
      canvas.getActiveObject();
    if (!(activeObject instanceof fabric.Group)) return;

    activeObject.toActiveSelection();
    canvas.requestRenderAll();
  }, [canvas]);

  return (
    <>
      {selection?.selected?.length && canvas && (
        <>
          {selection.selected.length > 1 && (
            <ContextMenuItem onClick={groupItems}>
              <p>Group selection</p>
            </ContextMenuItem>
          )}

          {selection.selected.length === 1 && canvas.getActiveObject()?.type === "group" && (
            <ContextMenuItem onClick={ungroupItems}>
              <p>Ungroup selection</p>
            </ContextMenuItem>
          )}
        </>
      )}
    </>
  );
};

export default GroupSelection;
