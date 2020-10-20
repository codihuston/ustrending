import React from "react";

import CssBaseline from "@material-ui/core/CssBaseline";
import EnhancedTable from "./EnhancedTable";

const NewTableChart = ({ dailyTrends, colorsByTopic }) => {
  const rows = [];
  const columns = React.useMemo(
    () => [
      {
        Header: "State",
        accessor: "name",
      },
      {
        Header: "#1",
        accessor: "0",
      },
      {
        Header: "#2",
        accessor: "1",
      },
      {
        Header: "#3",
        accessor: "2",
      },
      {
        Header: "#4",
        accessor: "3",
      },
      {
        Header: "#5",
        accessor: "4",
      },
      {
        Header: "#6",
        accessor: "5",
      },
      {
        Header: "#7",
        accessor: "6",
      },
      {
        Header: "#8",
        accessor: "9",
      },
    ],
    []
  );

  dailyTrends.forEach((value, key) => {
    const topics = [];

    value.forEach((topic) => {
      topics.push(topic.topic);
    });

    rows.push({
      name: key,
      ...topics,
      cellStyle: {
        backgroundColor: "red",
      },
    });
  });

  rows.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });

  if (!rows.length) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <CssBaseline />
      <EnhancedTable
        columns={columns}
        data={rows}
        defaultPageSize={rows.length}
      />
    </div>
  );
};

export default NewTableChart;
