import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";

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
    </Paper>
  );
}

export default TrendingToday;
