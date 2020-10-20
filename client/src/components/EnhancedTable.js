import React from "react";
import MaUTable from "@material-ui/core/Table";
import PropTypes from "prop-types";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableFooter from "@material-ui/core/TableFooter";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TablePaginationActions from "./TablePaginationActions";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import TableToolbar from "./TableToolbar";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import InsertChartIcon from "@material-ui/icons/InsertChart";
import GetAppIcon from "@material-ui/icons/GetApp";
import PictureAsPdfIcon from "@material-ui/icons/PictureAsPdf";
import {
  useGlobalFilter,
  useFilters,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";
import { useExportData } from "react-table-plugins";
import Papa from "papaparse";
import XLSX from "xlsx";
import JsPDF from "jspdf";
import "jspdf-autotable";
import { matchSorter } from "match-sorter";
import invert from "invert-color";

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val) => !val;

function getExportFileBlob({ columns, data, fileType, fileName }) {
  if (fileType === "csv") {
    // CSV example
    const headerNames = columns.map((col) => col.exportValue);
    const csvString = Papa.unparse({ fields: headerNames, data });
    return new Blob([csvString], { type: "text/csv" });
  } else if (fileType === "xlsx") {
    // XLSX example

    const header = columns.map((c) => c.exportValue);
    const compatibleData = data.map((row) => {
      const obj = {};
      header.forEach((col, index) => {
        obj[col] = row[index];
      });
      return obj;
    });

    let wb = XLSX.utils.book_new();
    let ws1 = XLSX.utils.json_to_sheet(compatibleData, {
      header,
    });
    XLSX.utils.book_append_sheet(wb, ws1, "React Table Data");
    XLSX.writeFile(wb, `${fileName}.xlsx`);

    // Returning false as downloading of file is already taken care of
    return false;
  }
  //PDF example
  if (fileType === "pdf") {
    const headerNames = columns.map((column) => column.exportValue);
    const doc = new JsPDF();
    doc.autoTable({
      head: [headerNames],
      body: data,
      margin: { top: 20 },
      styles: {
        minCellHeight: 9,
        halign: "left",
        valign: "center",
        fontSize: 11,
      },
    });
    doc.save(`${fileName}.pdf`);

    return false;
  }

  // Other formats goes here
  return false;
}

const Filter = ({ column }) => {
  return (
    <div style={{ marginTop: 5 }} onClick={(event) => event.stopPropagation()}>
      {column.canFilter && column.render("Filter")}
    </div>
  );
};

const EnhancedTable = ({
  columns,
  data,
  updateMyData,
  skipPageReset,
  defaultPageSize,
  colorsByTopic,
}) => {
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

  // This is a custom filter UI for selecting
  // a unique option from a list
  function SelectColumnFilter({
    column: { filterValue, setFilter, preFilteredRows, id },
  }) {
    // Calculate the options for filtering
    // using the preFilteredRows
    const options = React.useMemo(() => {
      const options = new Set();
      preFilteredRows.forEach((row) => {
        options.add(row.values[id]);
      });
      return [...options.values()];
    }, [id, preFilteredRows]);

    // Render a multi-select box
    return (
      <select
        value={filterValue}
        onChange={(e) => {
          setFilter(e.target.value || undefined);
        }}
      >
        <option value="">All</option>
        {options.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const {
    getTableProps,
    headerGroups,
    prepareRow,
    page,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize },
    exportData,
  } = useTable(
    {
      columns,
      data,
      autoResetPage: !skipPageReset,
      // updateMyData isn't part of the API, but
      // anything we put into these options will
      // automatically be available on the instance.
      // That way we can call this function from our
      // cell renderer!
      updateMyData,
      initialState: {
        pageSize: defaultPageSize,
      },
      defaultColumn,
      filterTypes,
      getExportFileBlob,
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    usePagination,
    useRowSelect,
    useExportData
  );

  const [dense, setDense] = React.useState(true);
  const [isBackgroundColored, setIsBackgroundColored] = React.useState(false);

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
        <ButtonGroup
          variant="contained"
          color="primary"
          aria-label="contained primary button group"
        >
          <Button
            title="Export as .csv"
            onClick={() => {
              exportData("csv", false);
            }}
          >
            <GetAppIcon />
          </Button>
          <Button
            title="Export as .xlsx"
            onClick={() => {
              exportData("xlsx", false);
            }}
          >
            <InsertChartIcon />
          </Button>
          <Button
            title="Export as .pdf"
            onClick={() => {
              exportData("pdf", false);
            }}
          >
            <PictureAsPdfIcon />
          </Button>
        </ButtonGroup>
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
                  <div>
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
                  </div>
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
                        const backgroundColor = colorsByTopic.get(cell.value);

                        if (isBackgroundColored && backgroundColor) {
                          return {
                            backgroundColor,
                            color: invert(backgroundColor, true),
                          };
                        }
                        return {};
                      })()}
                    >
                      {cell.render("Cell")}
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
};

EnhancedTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
};

export default EnhancedTable;
