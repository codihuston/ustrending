import React, { useContext } from "react";
import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import ColorContext, { colorPalettes } from "../context/ColorContext";

import { capitalizeFirst } from "../lib/utils";

function ColorSelector(props) {
  const colorPalett = useContext(ColorContext);
  const { handleChangeColors } = props;
  const [colorScheme, setColorScheme] = React.useState(colorPalett);

  const handleSelect = (event) => {
    setColorScheme(event.target.value);
    handleChangeColors(event.target.value);
  };

  return (
    <>
      <InputLabel id="color-scheme-label">Color Palette</InputLabel>
      <Typography>
        Select a color palette to use for the trending topics.
      </Typography>
      <Select
        labelId="color-scheme-label"
        id="color-scheme"
        value={colorScheme}
        onChange={handleSelect}
        fullWidth={true}
        mb={3}
      >
        {Object.keys(colorPalettes).map((theme) => (
          <MenuItem key={theme} value={theme}>
            {capitalizeFirst(theme)}
          </MenuItem>
        ))}
      </Select>
    </>
  );
}

export default ColorSelector;
