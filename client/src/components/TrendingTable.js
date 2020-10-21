import React from "react";
import PropTypes from "prop-types";
import List from "@material-ui/core/List";
import Box from "@material-ui/core/Box";

import TopicDetailModal from "./TopicDetailModal";

const TrendingTable = ({ dailyTrends }) => {
  console.log("Daily Trends", dailyTrends);
  const rows = dailyTrends;

  return (
    <Box maxWidth="25%">
      <List>
        {rows.map((row, i) => (
          <TopicDetailModal
            key={row.title?.query ? row.title?.query : i}
            topic={row}
            rank={i}
          />
        ))}
      </List>
    </Box>
  );
};

export default TrendingTable;
