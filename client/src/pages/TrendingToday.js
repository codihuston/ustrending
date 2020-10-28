import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import TrendingTable from "../components/TrendingTable";
import TopicDetailModal from "../components/TopicDetailModal";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
}));

function TrendingToday(props) {
  const classes = useStyles();
  const { dailyTrends } = props;
  const [open, setOpen] = useState(false);
  const [selectedTopicNumber, setSelectedTopicNumber] = useState(null);

  const handleOpen = (event, rank) => {
    setOpen(true);
    setSelectedTopicNumber(rank);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTopicNumber(null);
  };

  return (
    <Paper className={classes.root}>
      <Box p={3}>
        <Typography variant="h2">Trending Today</Typography>
        <Typography paragraph>
          Below is a list of topics that are trending on Google Trends today.
        </Typography>
        <Box fontStyle="italic">
          <Typography
            paragraph
            align="center"
            variant="subtitle1"
            color="textSecondary"
          >
            Click on a row below for more information about the trending topic!
          </Typography>
        </Box>
        <TrendingTable
          {...props}
          handleOpen={handleOpen}
          setSelectedTopicNumber={setSelectedTopicNumber}
        ></TrendingTable>
        {dailyTrends && dailyTrends[selectedTopicNumber] ? (
          <TopicDetailModal
            topic={dailyTrends[selectedTopicNumber]}
            rank={selectedTopicNumber}
            open={open}
            handleClose={handleClose}
          />
        ) : (
          ""
        )}
      </Box>
    </Paper>
  );
}

export default TrendingToday;
