import { memo } from "react";
import styles from "./Avatar.module.css";

function AvatarFC({ name, otherStyles }: Readonly<{ name: string; otherStyles: string }>) {
  return (
    <div className={`${styles.avatar} ${otherStyles} h-9 w-9`} data-tooltip={name}>
      <img
        alt={name}
        src={`https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`}
        className={styles.avatar_picture}
      />
    </div>
  );
}

export const Avatar = memo(AvatarFC);
