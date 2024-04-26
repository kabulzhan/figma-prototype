import { fabric } from "fabric";
import { useAtomValue } from "jotai";
import { canvasAtom, selectionAtom } from "@/atoms/atoms";

import { ContextMenuItem } from "../context-menu-components";
import { useCallback } from "react";

const GroupSelection = () => {
  const canvas = useAtomValue(canvasAtom);
  console.log("%c [ canvas ]-8", "font-size:13px; background:#ccc; color:blue;", canvas);
  const selection = useAtomValue(selectionAtom);

  const groupItems = useCallback(() => {
    if (!canvas || !selection) return;

    const group = new fabric.Group(selection);

    canvas.add(group);
    canvas.requestRenderAll();
  }, [selection, canvas]);

  return (
    <>
      {selection?.length && selection.length > 1 && (
        <ContextMenuItem onClick={groupItems}>
          <p>Group selection</p>
        </ContextMenuItem>
      )}
    </>
  );
};

export default GroupSelection;
