import { shortcuts } from "@/constants";
import { ContextMenuContent, ContextMenuItem } from "./context-menu-components";
import { memo } from "react";
import GroupSelection from "./context-menu-items/GroupSelection";

type ContextMenuProps = {
  handleContextMenuClick: (key: string) => void;
};

function ContextMenuFC({ handleContextMenuClick }: Readonly<ContextMenuProps>) {
  return (
    <ContextMenuContent className="right-menu-content">
      <GroupSelection />
      {shortcuts.map((item) => (
        <ContextMenuItem key={item.key} onClick={() => handleContextMenuClick(item.name)}>
          <p>{item.name}</p>
          <p className="text-xs text-primary-grey-300">{item.shortcut}</p>
        </ContextMenuItem>
      ))}
    </ContextMenuContent>
  );
}

const ContextMenu = memo(ContextMenuFC);

export default ContextMenu;
