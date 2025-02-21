import React, { FunctionComponent, useState, useEffect } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import InputLabel from "@material-ui/core/InputLabel";
import MyLocationIcon from "@material-ui/icons/MyLocation";

import {
  useDebouncedCallback,
} from "../hooks";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: "2px 4px",
      display: "flex",
      alignItems: "center",
      width: 400,
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
    divider: {
      height: 28,
      margin: 4,
    },
  })
);

type Props = {
  handleChangeZipcode(zipcode: string);
  handleChangeCoordinates(coordinates: [number, number]);
  initialValue: string;
};

const CustomizedInputBase: FunctionComponent<Props> = ({
  handleChangeZipcode,
  handleChangeCoordinates,
  initialValue,
}) => {
  const classes = useStyles();
  const [value, setValue] = useState<string>(initialValue);

  const handleClickGPS = () => {
    navigator.geolocation.getCurrentPosition(function (position) {
      handleChangeCoordinates([
        position.coords.longitude,
        position.coords.latitude,
      ]);
    });
  };

  const handleChangeValue = (event) => {
    setValue(event.target.value);
  };

  const debouncedSetZipcode = useDebouncedCallback(handleChangeZipcode, 1000);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    debouncedSetZipcode(value);
  }, [value]);

  return (
    <Paper component="form" className={classes.root}>
      <IconButton
        className={classes.iconButton}
        aria-label="menu"
        onClick={handleClickGPS}
      >
        <MyLocationIcon />
      </IconButton>
      <InputLabel htmlFor="zip">Zipcode</InputLabel>
      <InputBase
        className={classes.input}
        placeholder="Enter a Zipcode"
        inputProps={{ "aria-label": "Enter a zipcode", label: "Zipcode" }}
        // defaultValue={value}
        value={value}
        name="zip"
        id="zip"
        onChange={handleChangeValue}
      />
    </Paper>
  );
};

export default CustomizedInputBase;
