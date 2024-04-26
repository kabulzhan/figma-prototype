import { memo } from "react";

import { navElements } from "@/constants";
import { ActiveElement, INavElement, NavbarProps } from "@/types/type";

import { Button } from "./ui/button";
import ShapesMenu from "./ShapesMenu";
import ActiveUsers from "./users/ActiveUsers";

const NavbarFC = ({
  activeElement,
  imageInputRef,
  handleImageUpload,
  handleActiveElement,
}: NavbarProps) => {
  const isActive = (value: string | Array<ActiveElement>) =>
    (activeElement && activeElement.value === value) ||
    (Array.isArray(value) && value.some((val) => val?.value === activeElement?.value));

  return (
    <nav className="flex select-none items-center justify-between gap-4 bg-primary-black px-5 text-white">
      <img src="/assets/logo.svg" alt="FigPro Logo" width={58} height={20} />

      <ul className="flex flex-row">
        {navElements.map((item: INavElement) => (
          <li
            key={item.name}
            className={`group flex items-center justify-center px-2.5 py-5 ${
              isActive(item.value) ? "bg-primary-green" : "hover:bg-primary-grey-200"
            }`}
          >
            {/* If value is an array means it's a nav element with sub options i.e., dropdown */}
            {Array.isArray(item.value) ? (
              <ShapesMenu
                item={item}
                activeElement={activeElement}
                imageInputRef={imageInputRef}
                handleActiveElement={handleActiveElement}
                handleImageUpload={handleImageUpload}
              />
            ) : (
              <Button
                className="relative h-5 w-5 object-contain"
                onClick={() => {
                  handleActiveElement(item as ActiveElement);
                }}
              >
                <img src={item.icon} alt={item.name} className="absolute h-5 w-5" />
              </Button>
            )}
          </li>
        ))}
      </ul>

      <ActiveUsers />
    </nav>
  );
};

const Navbar = memo(NavbarFC);

export default Navbar;
