import React from "react";

import TableChart from "../components/TableChart";

function TableView({ dailyTrends, colorsByTopic }) {
  return (
    <TableChart
      dailyTrends={dailyTrends}
      colorsByTopic={colorsByTopic}
    ></TableChart>
  );
}

export default TableView;
