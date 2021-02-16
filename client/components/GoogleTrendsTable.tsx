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
} from "@material-ui/core";
import TablePaginationActions from "./TablePaginationActions";

import { getListPositionChange } from "../lib";
import { TableToolbar } from "./TableToolbar";
import { PositionChangeIndicator } from "./PositionChangeIndicator";
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

// Define a default UI for filtering
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length;

  return (
    <input
      value={filterValue || ""}
      onChange={(e) => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  );
}

interface Props<T extends Record<string, unknown>> extends TableOptions<T> {
  defaultPageSize: number;
  handleTrendClick(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    name: string
  ): void;
  colorMap: Map<string, string>;
  skipPageReset: boolean;
  sourceMap: Map<string, number>;
}

export function GoogleTrendsTable<T extends Record<string, unknown>>(
  props: PropsWithChildren<Props<T>>
): ReactElement {
  const {
    colorMap,
    columns,
    data,
    defaultPageSize,
    handleTrendClick,
    skipPageReset,
    sourceMap,
  } = props;
  const [dense, setDense] = React.useState(true);
  const [isBackgroundColored, setIsBackgroundColored] = React.useState(true);
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

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  function handleChangeIsBackgroundColored(event) {
    setIsBackgroundColored(event.target.checked);
  }

  const handleChangePage = (event, newPage) => {
    gotoPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(Number(event.target.value));
  };

  // Render the UI for your table
  return (
    <TableContainer>
      <TableToolbar>
        <FormControlLabel
          control={
            <Switch
              checked={isBackgroundColored}
              onChange={handleChangeIsBackgroundColored}
            />
          }
          label="Show colors"
        />
        <FormControlLabel
          control={<Switch checked={dense} onChange={handleChangeDense} />}
          label="Dense padding"
        />
      </TableToolbar>
      <Table size={dense ? "small" : "medium"} {...getTableProps()}>
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

                  return (
                    <TableCell
                      {...cell.getCellProps()}
                      style={(function () {
                        // handle coloring of cells
                        const backgroundColor = colorMap.get(cell.value);

                        if (isBackgroundColored && backgroundColor) {
                          return {
                            backgroundColor,
                            color: invert(backgroundColor, true),
                          };
                        }
                        return {};
                      })()}
                    >
                      <Box display="flex" justifyContent="flex-start">
                        <Box>
                          <div style={{ width: "9rem", whiteSpace: "nowrap" }}>
                            <Box
                              onClick={(
                                event: React.MouseEvent<
                                  HTMLDivElement,
                                  MouseEvent
                                >
                              ) => handleTrendClick(event, cell.value)}
                              component="div"
                              textOverflow="ellipsis"
                              overflow="hidden"
                              title={cell.value}
                              className="cursor-pointer"
                            >
                              <b>{cell.value}</b>
                            </Box>
                          </div>
                        </Box>
                        {/* do not show indicators on the first column (region name) */}
                        {j === 0 ? null : (
                          <Box>
                            <PositionChangeIndicator index={positionChange} />
                          </Box>
                        )}
                      </Box>
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
        style={{
          display: "flex",
          width: "100vh",
        }}
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
