import React from "react";

import clsx from "clsx";
import { lighten, makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import Toolbar from "@material-ui/core/Toolbar";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: "1 1 100%",
  },
}));

const TableToolbar = (props) => {
  const classes = useToolbarStyles();
  return (
    <Toolbar>
      <FormControlLabel
        control={
          <Switch
            checked={props.isBackgroundColored}
            onChange={props.handleChangeIsBackgroundColored}
          />
        }
        label="Background colors"
      />
      <FormControlLabel
        control={
          <Switch checked={props.dense} onChange={props.handleChangeDense} />
        }
        label="Dense padding"
      />
    </Toolbar>
  );
};

TableToolbar.propTypes = {};

export default TableToolbar;
