import Select, { ValueType } from "react-select";
import InputLabel from "@material-ui/core/InputLabel";
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
      <InputLabel htmlFor="color-palette">Palette Name</InputLabel>
      <Select
        instanceId={1}
        name="color-palette"
        value={selectedPalette}
        isSearchable={true}
        onChange={handleChangePalette}
        options={paletteOptions}
      ></Select>
      <InputLabel htmlFor="contrast-level">Contrast Level</InputLabel>
      <Select
        instanceId={2}
        name="contrast-level"
        value={selectedContrast}
        isSearchable={true}
        onChange={handleChangeContrast}
        options={contrastOptions}
      ></Select>
    </div>
  );
}
