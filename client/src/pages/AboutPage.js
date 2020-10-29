import React from "react";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

function AboutPage() {
  return (
    <Paper>
      <Box p={3}>
        <Typography variant="h2">About</Typography>
        <Typography paragraph>This app is about...</Typography>
      </Box>
    </Paper>
  );
}

export default AboutPage;
