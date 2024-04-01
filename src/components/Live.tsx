"use client";

import { useCallback, useEffect, useState } from "react";
import { useBroadcastEvent, useEventListener, useMyPresence } from "#root/liveblocks.config";
import LiveCursors from "./cursor/LiveCursors";
import CursorChat from "./cursor/CursorChat";
import {
  ActiveElement,
  Attributes,
  CursorMode,
  CursorState,
  Reaction,
  ReactionEvent,
} from "@/types/type";
import ReactionSelector from "./reaction/ReactionButton";
import FlyingReaction from "./reaction/FlyingReaction";
import useInterval from "@/hooks/useInterval";
import Canvas from "./Canvas";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { shortcuts } from "@/constants";

type LiveProps = {
  shapeRef: React.MutableRefObject<fabric.Object | null>;
  selectedShapeRef: React.MutableRefObject<string | null>;
  isDrawing: React.MutableRefObject<boolean>;
  setActiveElement: React.Dispatch<React.SetStateAction<ActiveElement>>;
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  deleteShapeFromStorage: (objectId: any) => void;
  syncShapeInStorage: (object: any) => void;
  isEditingRef: React.MutableRefObject<boolean>;
  setElementAttributes: React.Dispatch<React.SetStateAction<Attributes>>;
  activeObjectRef: React.MutableRefObject<fabric.Object | null>;
  undo: () => void;
  redo: () => void;
};

const Live = ({
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
}: LiveProps) => {
  const [{ cursor }, updateMyPresence] = useMyPresence();

  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });

  const [reaction, setReaction] = useState<Reaction[]>([]);

  const broadcast = useBroadcastEvent();

  useInterval(() => {
    setReaction((reaction) => reaction.filter((r) => r.timestamp > Date.now() - 4000));
  }, 1000);

  useInterval(() => {
    if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
      setReaction((reactions) =>
        reactions.concat([
          {
            point: { x: cursor.x, y: cursor.y },
            value: cursorState.reaction,
            timestamp: Date.now(),
          },
        ]),
      );

      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);

  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;

    setReaction((reactions) =>
      reactions.concat([
        {
          point: { x: event.x, y: event.y },
          value: event.value,
          timestamp: Date.now(),
        },
      ]),
    );
  });

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();

      if (cursor === null || cursorState.mode !== CursorMode.ReactionSelector) {
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
        updateMyPresence({ cursor: { x, y } });
      }
    },
    [updateMyPresence, cursor, cursorState],
  );

  const handlePointerLeave = useCallback(() => {
    setCursorState({ mode: CursorMode.Hidden });
    updateMyPresence({ cursor: null, message: null });
  }, [updateMyPresence]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      // event.preventDefault();
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
      updateMyPresence({ cursor: { x, y } });

      setCursorState((state: CursorState) =>
        cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state,
      );
    },
    [updateMyPresence, cursorState.mode, setCursorState],
  );

  const handlePointerUp = useCallback(() => {
    setCursorState((state: CursorState) =>
      cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state,
    );
  }, [cursorState.mode, setCursorState]);

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (e.key === "Escape") {
        updateMyPresence({ message: "" });
        setCursorState({ mode: CursorMode.Hidden });
      } else if (e.key === "e") {
        setCursorState({
          mode: CursorMode.ReactionSelector,
        });
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);

  const setReactions = useCallback((reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  const handleContextMenuClick = useCallback((key: string) => {
    switch (key) {
      case "Chat":
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
        break;

      case "Undo":
        undo();
        break;

      case "Redo":
        redo();
        break;

      case "Reactions":
        setCursorState({
          mode: CursorMode.ReactionSelector,
        });
        break;

      default:
        break;
    }
  }, []);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          id="canvas"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          className="absolute flex h-[100vh] w-full items-center justify-center text-center"
        >
          <Canvas
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

          {reaction.map((r) => (
            <FlyingReaction
              key={r.timestamp.toString()}
              x={r.point.x}
              y={r.point.y}
              timestamp={r.timestamp}
              value={r.value}
            />
          ))}

          {cursor && (
            <CursorChat
              cursor={cursor}
              cursorState={cursorState}
              setCursorState={setCursorState}
              updateMyPresence={updateMyPresence}
            />
          )}

          {cursorState.mode === CursorMode.ReactionSelector && (
            <ReactionSelector setReaction={setReactions} />
          )}

          <LiveCursors />

          {/* <Comments /> */}
        </div>
      </ContextMenuTrigger>

      {/* <ContextMenuTrigger>Right click</ContextMenuTrigger> */}
      <ContextMenuContent className="right-menu-content">
        {shortcuts.map((item) => (
          <ContextMenuItem key={item.key} onClick={() => handleContextMenuClick(item.name)}>
            <p>{item.name}</p>
            <p className="text-xs text-primary-grey-300">{item.shortcut}</p>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default Live;
