import React from "react";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";

import TrendingTable from "../components/TrendingTable";

function TrendingToday(props) {
  return (
    <Paper>
      <TrendingTable {...props}
      
      ></TrendingTable>
    </Paper>
  );
}

export default TrendingToday;
