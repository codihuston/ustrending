import React, { ReactElement, PropsWithChildren } from "react";
import { matchSorter } from "match-sorter";
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
import invert from "invert-color";
import MaUTable from "@material-ui/core/Table";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableFooter from "@material-ui/core/TableFooter";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TablePaginationActions from "./TablePaginationActions";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";

import { TableToolbar } from "./TableToolbar";

function fuzzyTextFilterFn(rows: Row[], id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val) => !val;

const Filter = ({ column }) => {
  return (
    <div style={{ marginTop: 5 }} onClick={(event) => event.stopPropagation()}>
      {column.canFilter && column.render("Filter")}
    </div>
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
  skipPageReset: boolean;
  defaultPageSize: number;
  colorMap: Map<string, string>;
}

export function GoogleTrendsTable<T extends Record<string, unknown>>(
  props: PropsWithChildren<Props<T>>
): ReactElement {
  const { columns, data, skipPageReset, defaultPageSize, colorMap } = props;
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
          label="Background colors"
        />
        <FormControlLabel
          control={<Switch checked={dense} onChange={handleChangeDense} />}
          label="Dense padding"
        />
      </TableToolbar>
      <MaUTable size={dense ? "small" : "medium"} {...getTableProps()}>
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
                    {column.render("Header")}
                    {column.id !== "selection" ? (
                      <TableSortLabel
                        active={column.isSorted}
                        // react-table has a unsorted state which is not treated here
                        direction={column.isSortedDesc ? "desc" : "asc"}
                      />
                    ) : null}
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
                {row.cells.map((cell) => {
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
                      {isBackgroundColored ? (
                        <b>{cell.render("Cell")}</b>
                      ) : (
                        cell.render("Cell")
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              style={{
                display: "flex",
                // width: "100vh",
              }}
              rowsPerPageOptions={[
                5,
                10,
                25,
                { label: "All", value: data.length },
              ]}
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
          </TableRow>
        </TableFooter>
      </MaUTable>
    </TableContainer>
  );
}
