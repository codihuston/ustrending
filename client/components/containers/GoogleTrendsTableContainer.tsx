import React from "react";

import { GoogleTrendsTable } from "../GoogleTrendsTable";
import { GoogleRegionTrend, GoogleDailyTrend } from "../../types";

type Props = {
  googleDailyTrends: GoogleDailyTrend[];
  googleDailyTrendsByState: GoogleRegionTrend[];
  colorMap: Map<string, string>;
};

export function GoogleTrendsTableContainer({
  googleDailyTrends,
  googleDailyTrendsByState,
  colorMap,
}: Props) {
  const DEFAULT_MAX_ROW_LENGTH = 25;
  const rows = [];
  // the first column will contain the region name
  let columns = [{ Header: `Region`, accessor: "region" }];

  // all subsequent columns will contain a numbered trend (1..N)
  googleDailyTrends.forEach((trend, i) => {
    columns.push({ Header: `#${i + 1}`, accessor: i.toString() });
  });

  // build out the rows, mapped to each of the columns
  googleDailyTrendsByState.forEach((region, key) => {
    const topics = [];

    region.trends.forEach((topic) => {
      topics.push(topic.topic);
    });

    rows.push({
      region: region.name,
      ...topics,
    });
  });

  return (
    <div>
      <GoogleTrendsTable
        columns={columns}
        data={rows}
        skipPageReset={false}
        defaultPageSize={
          rows.length > DEFAULT_MAX_ROW_LENGTH
            ? DEFAULT_MAX_ROW_LENGTH
            : rows.length
        }
        colorMap={colorMap}
      />
    </div>
  );
}
