import React, { FunctionComponent, useState, useEffect } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import DirectionsIcon from "@material-ui/icons/Directions";
import MyLocationIcon from "@material-ui/icons/MyLocation";

import {
  useDebouncedCallback,
  usePlacesByZipcode,
  usePlacesByGPS,
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
};

const CustomizedInputBase: FunctionComponent<Props> = ({
  handleChangeZipcode,
}) => {
  const classes = useStyles();
  const INITIAL_VALUE = "10002"; // NYC
  const [value, setValue] = useState<string>(INITIAL_VALUE);

  const handleClickGPS = () => {
    navigator.geolocation.getCurrentPosition(function (position) {
      console.log(position.coords.latitude, position.coords.longitude);
    });
  };

  const handleChangeValue = (event) => {
    setValue(event.target.value);
  };

  const debouncedSetZipcode = useDebouncedCallback(handleChangeZipcode, 1000);

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
      <InputBase
        className={classes.input}
        placeholder="Enter a Zipcode"
        inputProps={{ "aria-label": "enter a zipcode" }}
        value={value}
        onChange={handleChangeValue}
      />
      <IconButton
        type="submit"
        className={classes.iconButton}
        aria-label="search"
      >
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

export default CustomizedInputBase;
