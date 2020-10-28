import React from "react";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import TrendingByStateTable from "../components/TrendingByStateTable";

function TableView(props) {
  return (
    <Paper>
      <Box p={3}>
        <Typography variant="h2">Trending Table</Typography>
        <Typography paragraph>
          Below is a table-view of the trending data for each U.S. State.
        </Typography>
        <TrendingByStateTable {...props}></TrendingByStateTable>
      </Box>
    </Paper>
  );
}

export default TableView;
