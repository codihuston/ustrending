import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";

import TopicDetailModal from "./TopicDetailModal";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
  },
}));

const TrendingTable = ({ dailyTrends }) => {
  const classes = useStyles();
  const rows = dailyTrends;

  return (
    <div className={classes.root}>
      <List aria-label="Top Google Trending Topics">
        {rows.map((row, i) => (
          <TopicDetailModal
            key={row.title?.query ? row.title?.query : i}
            topic={row}
            rank={i}
          />
        ))}
      </List>
    </div>
  );
};

export default TrendingTable;
