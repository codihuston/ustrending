import React, { memo } from "react";
import { withRouter } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert";

import MapChart from "../components/MapChart";

function MapView(props) {
  return (
    <Paper>
      <Box p={3}>
        <Box mb={3}>
          <Alert severity="info">
            Note: It is normal for there to be fewer topics towards the
            beginning of the day. The map will display more topics as google
            updates their trending searches throughout the day, typically on
            hourly intervals.
          </Alert>
        </Box>
        <Typography paragraph>
          Below is a color-coded map that will display which Google Trends are
          trending the most for each U.S. state. The colors are assigned by
          <b> topic rank</b> rather than by topic title. For example, if topic A
          is trending #10, then reaches #2, its color would change accordingly.
        </Typography>
        <MapChart {...props} />
      </Box>
    </Paper>
  );
}

export default memo(withRouter(MapView));
