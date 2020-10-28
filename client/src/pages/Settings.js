import React, { useContext } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import ColorContext from "../context/ColorContext";
import invert from "invert-color";

import ColorSelector from "../components/ColorSelector";
import { padZero } from "../lib/utils";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
}));

function Settings(props) {
  const classes = useStyles();
  const currentColors = useContext(ColorContext);

  return (
    <Paper className={classes.root}>
      <Box p={3}>
        <Box mb={1}>
          <ColorSelector {...props}></ColorSelector>
        </Box>
        <Box display="flex" flexWrap="wrap" flexBasis="0" flexGrow="1">
          {currentColors.map((backgroundColor, i) => (
            <Box
              key={backgroundColor}
              style={{
                backgroundColor,
                color: invert(backgroundColor, true),
              }}
              padding={2}
            >
              <Paper>
                <Box padding={1}>#{padZero(i + 1)}</Box>
              </Paper>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

export default Settings;
