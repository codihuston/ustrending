import React, { ReactElement, PropsWithChildren } from "react";
import { matchSorter } from "match-sorter";
import invert from "invert-color";
import {
  useGlobalFilter,
  useFilters,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
  Row,
  TableOptions,
} from "react-table";
import {
  Box,
  FormControlLabel,
  makeStyles,
  Table,
  Switch,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Theme,
} from "@material-ui/core";
import TablePaginationActions from "./TablePaginationActions";

import { getListPositionChange } from "../lib";
import { useDebouncedCallback } from "../hooks";
import TableToolbar from "./TableToolbar";
import PositionChangeIndicator from "./PositionChangeIndicator";
function fuzzyTextFilterFn(rows: Row[], id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val) => !val;

const Filter = ({ column }) => {
  return (
    <Box mt={1} onClick={(event) => event.stopPropagation()}>
      {column.canFilter && column.render("Filter")}
    </Box>
  );
};

/**
 * Define a default UI for filtering. Leverage debouncing for filter changes.
 * This prevents the table from rapidly updating upon 100% of each character entry. If
 * one types quickly, it could impact table performance noticibly. Now, it will only
 * execute the filter after the debounce timeframe has passed.
 *
 * Ref: https://spectrum.chat/react-table/general/v7-how-to-debounce-the-filter-columns~3800ccc3-c6a7-40fa-8786-5e9fa044e8dd?m=MTU2ODM4OTUxMTM2Mw==
 * @param param0
 */
function DefaultColumnFilter({ column: { preFilteredRows, setFilter } }) {
  const count = preFilteredRows.length;
  const [localFilterValue, setlocalFilterValue] = React.useState("");

  const debouncedSetFilter = useDebouncedCallback(setFilter, 250);

  const handleChange = (e) => {
    setlocalFilterValue(e.target.value || undefined);
    debouncedSetFilter(e.target.value);
  };

  return (
    <input
      value={localFilterValue || ""}
      onChange={handleChange}
      placeholder={`Search ${count} records...`}
    />
  );
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  flex: {
    display: "flex",
    justifyContent: "space-between"
  },
  trendLabel: {
    width: "8rem",
    whiteSpace: "nowrap",
  },
  overflow: {
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
  paginator: {
    display: "flex",
    width: "100vh",
  },
}));

interface Props<T extends Record<string, unknown>> extends TableOptions<T> {
  defaultPageSize: number;
  handleTrendClick(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    name: string
  ): void;
  colorMap: Map<string, string>;
  isWithColors: boolean;
  skipPageReset: boolean;
  sourceMap: Map<string, number>;
}

export default function GoogleTrendsTable<T extends Record<string, unknown>>(
  props: PropsWithChildren<Props<T>>
): ReactElement {
  const classes = useStyles();
  const {
    colorMap,
    columns,
    data,
    defaultPageSize,
    handleTrendClick,
    isWithColors,
    skipPageReset,
    sourceMap,
  } = props;
  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  );
  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    []
  );

  const instance = useTable<T>(
    {
      ...props,
      columns,
      data,
      autoResetPage: !skipPageReset,
      initialState: {
        pageSize: defaultPageSize,
      },
      defaultColumn,
      filterTypes,
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    usePagination,
    useRowSelect
  );

  const {
    getTableProps,
    headerGroups,
    prepareRow,
    page,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = instance;

  const handleChangePage = (event, newPage) => {
    gotoPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(Number(event.target.value));
  };

  const getTableCellStyle = (cell) => {
    // handle coloring of cells
    const backgroundColor = colorMap.get(cell.value);

    if (isWithColors && backgroundColor) {
      return {
        backgroundColor,
        color: invert(backgroundColor, true),
      };
    }
    return {};
  }

  // Render the UI for your table
  return (
    <TableContainer>
      <Table size={"small"} {...getTableProps()}>
        <TableHead>
          {headerGroups.map((headerGroup) => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <TableCell
                  {...(column.id === "selection"
                    ? column.getHeaderProps()
                    : column.getHeaderProps(column.getSortByToggleProps()))}
                >
                  <span>
                    <Box textAlign="center">
                      {column.render("Header")}
                      {column.id !== "selection" ? (
                        <TableSortLabel
                          active={column.isSorted}
                          // react-table has a unsorted state which is not treated here
                          direction={column.isSortedDesc ? "desc" : "asc"}
                        />
                      ) : null}
                    </Box>
                  </span>
                  <Filter column={column} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <TableRow {...row.getRowProps()}>
                {row.cells.map((cell, j) => {
                  // subtract 1 to account for the first column (which we do not need to count)
                  const positionChange = getListPositionChange(
                    cell.value,
                    j - 1,
                    sourceMap
                  );

                  // do nothing special for the first column
                  if (j === 0) {
                    return <TableCell key={j}>{cell.value}</TableCell>;
                  }

                  return (
                    <TableCell
                      {...cell.getCellProps()}
                      style={getTableCellStyle(cell)}
                      key={j}
                    >
                      <div className={classes.flex}>
                        <div>
                          <div className={classes.trendLabel}>
                            <div
                              onClick={(
                                event: React.MouseEvent<
                                  HTMLDivElement,
                                  MouseEvent
                                >
                              ) => handleTrendClick(event, cell.value)}
                              title={cell.value}
                              className={`${classes.overflow} cursor-pointer`}
                            >
                              <b>{cell.value}</b>
                            </div>
                          </div>
                        </div>
                        {/* do not show indicators on the first column (region name) */}
                        {j === 0 ? null : (
                          <div>
                            <PositionChangeIndicator index={positionChange} />
                          </div>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        className={classes.paginator}
        rowsPerPageOptions={[5, 10, 25, { label: "All", value: data.length }]}
        count={data.length}
        rowsPerPage={pageSize}
        page={pageIndex}
        SelectProps={{
          inputProps: { "aria-label": "rows per page" },
          native: true,
        }}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        ActionsComponent={TablePaginationActions}
      />
    </TableContainer>
  );
}
