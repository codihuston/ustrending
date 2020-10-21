import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";

import TrendingTable from "../components/TrendingTable";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
  },
}));

function TrendingToday(props) {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <TrendingTable {...props}></TrendingTable>
    </Paper>
  );
}

export default TrendingToday;
