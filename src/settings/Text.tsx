import { fontFamilyOptions, fontSizeOptions, fontWeightOptions } from "@/constants";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo } from "react";

const selectConfigs = [
  {
    property: "fontFamily",
    placeholder: "Choose a font",
    options: fontFamilyOptions,
  },
  { property: "fontSize", placeholder: "30", options: fontSizeOptions },
  {
    property: "fontWeight",
    placeholder: "Semibold",
    options: fontWeightOptions,
  },
];

type TextProps = {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  handleInputChange: (property: string, value: string) => void;
};

const Text = ({ fontFamily, fontSize, fontWeight, handleInputChange }: TextProps) => (
  <div className="flex flex-col gap-3 border-b border-primary-grey-200 px-5 py-3">
    <h3 className="text-[10px] uppercase">Text</h3>

    <div className="flex flex-col gap-3">
      {RenderSelect({
        config: selectConfigs[0],
        fontSize,
        fontWeight,
        fontFamily,
        handleInputChange,
      })}

      <div className="flex gap-2">
        {selectConfigs.slice(1).map((config) =>
          RenderSelect({
            config,
            fontSize,
            fontWeight,
            fontFamily,
            handleInputChange,
          }),
        )}
      </div>
    </div>
  </div>
);

type Props = {
  config: {
    property: string;
    placeholder: string;
    options: { label: string; value: string }[];
  };
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  handleInputChange: (property: string, value: string) => void;
};

const RenderSelect = ({ config, fontSize, fontWeight, fontFamily, handleInputChange }: Props) => {
  const { value, placeholder } = useMemo(() => {
    switch (config.property) {
      case "fontFamily":
        return { value: fontFamily, placeholder: "Choose a font" };
      case "fontSize":
        return { value: fontSize, placeholder: "30" };
      default:
        return { value: fontWeight, placeholder: "Semibold" };
    }
  }, [config?.property, fontFamily, fontWeight, fontSize]);

  return (
    <Select
      key={config.property}
      onValueChange={(value) => handleInputChange(config.property, value)}
      value={String(value)}
    >
      <SelectTrigger className="no-ring w-full rounded-sm border border-primary-grey-200">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="border-primary-grey-200 bg-primary-black text-primary-grey-300">
        {config.options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className=" hover:bg-primary-green hover:text-primary-black"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default Text;
