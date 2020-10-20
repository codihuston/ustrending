import React from "react";

import TrendingTable from "../components/TrendingTable";

function TableView({ dailyTrends, colorsByTopic }) {
  return (
    <TrendingTable
      dailyTrends={dailyTrends}
      colorsByTopic={colorsByTopic}
    ></TrendingTable>
  );
}

export default TableView;
