import Select, { ValueType } from "react-select";

import { palettes, contrasts } from "../themes";
import { SelectStringOptionType } from "../types";

type Props = {
  handleChangePalette(option: ValueType<SelectStringOptionType, false>): void;
  handleChangeContrast(option: ValueType<SelectStringOptionType, false>): void;
  selectedContrast: ValueType<SelectStringOptionType, false>;
  selectedPalette: ValueType<SelectStringOptionType, false>;
};

export default function ColorPalette({
  handleChangePalette,
  handleChangeContrast,
  selectedContrast,
  selectedPalette,
}: Props) {
  const paletteOptions = Object.keys(palettes).map((p) => {
    return {
      label: p,
      value: p,
    };
  });
  const contrastOptions = Object.keys(contrasts).map((p) => {
    return {
      label: p,
      value: p,
    };
  });

  return (
    <div>
      Palette Name:
      <Select
        value={selectedPalette}
        isSearchable={true}
        onChange={handleChangePalette}
        options={paletteOptions}
      ></Select>
      Contrast Level:
      <Select
        value={selectedContrast}
        isSearchable={true}
        onChange={handleChangeContrast}
        options={contrastOptions}
      ></Select>
    </div>
  );
}
