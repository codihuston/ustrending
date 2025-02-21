import React, { useMemo } from "react";

import GoogleTrendsTable from "../GoogleTrendsTable";
import Loading from "../Loading";

export type RowProps = {
  region: string;
  [key: string]: any;
};

type Props = {
  handleTrendClick(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    name: string
  ): void;
  googleTrendNames: string[];
  colorMap: Map<string, string>;
  isWithColors: boolean;
  rows: RowProps[];
  sourceMap: Map<string, number>;
};

export default function GoogleTrendsTableContainer({
  handleTrendClick,
  googleTrendNames,
  colorMap,
  isWithColors,
  rows,
  sourceMap,
}: Props) {
  return useMemo(() => {
    const DEFAULT_MAX_ROW_LENGTH = 25;
    // the first column will contain the region name
    let columns = [{ Header: `Region`, accessor: "region" }];

    // all subsequent columns will contain a numbered trend (1..N)
    googleTrendNames.forEach((trend, i) => {
      columns.push({ Header: `#${i + 1}`, accessor: i.toString() });
    });

    if (!rows || rows.length <= 0) {
      return <Loading />;
    }

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
          isWithColors={isWithColors}
          sourceMap={sourceMap}
          handleTrendClick={handleTrendClick}
        />
      </div>
    );
  }, [googleTrendNames, colorMap, isWithColors, rows, sourceMap]);
}
