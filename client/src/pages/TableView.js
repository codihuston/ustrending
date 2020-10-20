import React from "react";

import NewTableChart from "../components/NewTableChart";

function TableView({ dailyTrends, colorsByTopic }) {
  return (
    <NewTableChart
      dailyTrends={dailyTrends}
      colorsByTopic={colorsByTopic}
    ></NewTableChart>
  );
}

export default TableView;
