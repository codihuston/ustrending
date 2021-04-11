import React, { FunctionComponent, useState, useEffect } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
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
      <Divider className={classes.divider} orientation="vertical" />
      <InputBase
        className={classes.input}
        placeholder="Enter a Zipcode"
        inputProps={{ "aria-label": "enter a zipcode" }}
        value={value}
        onChange={handleChangeValue}
      />
    </Paper>
  );
};

export default CustomizedInputBase;
