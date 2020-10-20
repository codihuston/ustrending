import React from "react";
// import styled from "styled-components";
// import {
//   useTable,
//   usePagination,
//   useSortBy,
//   useFilters,
//   useGroupBy,
//   useExpanded,
//   useRowSelect,
// } from "react-table";
// import matchSorter from "match-sorter";

// import makeData from "./makeData";

// import PropTypes from "prop-types";
// import { lighten, makeStyles } from "@material-ui/core/styles";
// import Table from "@material-ui/core/Table";
// import TableBody from "@material-ui/core/TableBody";
// import TableCell from "@material-ui/core/TableCell";
// import TableContainer from "@material-ui/core/TableContainer";
// import TableHead from "@material-ui/core/TableHead";
// import TablePagination from "@material-ui/core/TablePagination";
// import TableRow from "@material-ui/core/TableRow";
// import TableSortLabel from "@material-ui/core/TableSortLabel";
// import Toolbar from "@material-ui/core/Toolbar";
// import Typography from "@material-ui/core/Typography";
// import Paper from "@material-ui/core/Paper";
// import IconButton from "@material-ui/core/IconButton";
// import Tooltip from "@material-ui/core/Tooltip";
// import FormControlLabel from "@material-ui/core/FormControlLabel";
// import Switch from "@material-ui/core/Switch";
// import FilterListIcon from "@material-ui/icons/FilterList";
// import GetAppIcon from "@material-ui/icons/GetApp";
// import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
// import invert from "invert-color";

// // function descendingComparator(a, b, orderBy) {
// //   if (b[orderBy] < a[orderBy]) {
// //     return -1;
// //   }
// //   if (b[orderBy] > a[orderBy]) {
// //     return 1;
// //   }
// //   return 0;
// // }

// // function getComparator(order, orderBy) {
// //   return order === "desc"
// //     ? (a, b) => descendingComparator(a, b, orderBy)
// //     : (a, b) => -descendingComparator(a, b, orderBy);
// // }

// // function stableSort(array, comparator) {
// //   const stabilizedThis = array.map((el, index) => [el, index]);
// //   stabilizedThis.sort((a, b) => {
// //     const order = comparator(a[0], b[0]);
// //     if (order !== 0) return order;
// //     return a[1] - b[1];
// //   });
// //   return stabilizedThis.map((el) => el[0]);
// // }

// // // TODO make dynamic
// // const headCells = [
// //   { title: "State", field: "name" },
// //   { title: "#1", field: "0" },
// //   { title: "#2", field: "1" },
// //   { title: "#3", field: "2" },
// //   { title: "#4", field: "3" },
// //   { title: "#5", field: "4" },
// //   { title: "#6", field: "5" },
// //   { title: "#7", field: "6" },
// //   { title: "#8", field: "7" },
// //   { title: "#9", field: "8" },
// //   { title: "#10", field: "9" },
// // ];
// // // const headCells = [
// // //   {
// // //     name: "name",
// // //     numeric: false,
// // //     disablePadding: false,
// // //     title: "State",
// // //   },
// // //   { name: "0", numeric: true, disablePadding: false, title: "#1" },
// // //   { name: "1", numeric: true, disablePadding: false, title: "#2" },
// // //   { name: "2", numeric: true, disablePadding: false, title: "#3" },
// // //   { name: "3", numeric: true, disablePadding: false, title: "#4" },
// // //   { name: "4", numeric: true, disablePadding: false, title: "#5" },
// // //   { name: "5", numeric: true, disablePadding: false, title: "#6" },
// // //   { name: "6", numeric: true, disablePadding: false, title: "#7" },
// // //   { name: "7", numeric: true, disablePadding: false, title: "#8" },
// // //   { name: "8", numeric: true, disablePadding: false, title: "#9" },
// // //   { name: "9", numeric: true, disablePadding: false, title: "#10" },
// // // ];

// // function EnhancedTableHead(props) {
// //   const { classes, order, orderBy, onRequestSort } = props;

// //   const createSortHandler = (property) => (event) => {
// //     onRequestSort(event, property);
// //   };

// //   return (
// //     <TableHead>
// //       <TableRow>
// //         {headCells.map((headCell) => (
// //           <TableCell
// //             key={headCell.id}
// //             align={headCell.numeric ? "right" : "left"}
// //             padding={headCell.disablePadding ? "none" : "default"}
// //             sortDirection={orderBy === headCell.id ? order : false}
// //           >
// //             <TableSortLabel
// //               active={orderBy === headCell.id}
// //               direction={orderBy === headCell.id ? order : "asc"}
// //               onClick={createSortHandler(headCell.id)}
// //             >
// //               {headCell.label}
// //               {orderBy === headCell.id ? (
// //                 <span className={classes.visuallyHidden}>
// //                   {order === "desc" ? "sorted descending" : "sorted ascending"}
// //                 </span>
// //               ) : null}
// //             </TableSortLabel>
// //           </TableCell>
// //         ))}
// //       </TableRow>
// //     </TableHead>
// //   );
// // }

// // EnhancedTableHead.propTypes = {
// //   classes: PropTypes.object.isRequired,
// //   onRequestSort: PropTypes.func.isRequired,
// //   onSelectAllClick: PropTypes.func.isRequired,
// //   order: PropTypes.oneOf(["asc", "desc"]).isRequired,
// //   orderBy: PropTypes.string.isRequired,
// //   rowCount: PropTypes.number.isRequired,
// // };

// // const useToolbarStyles = makeStyles((theme) => ({
// //   root: {
// //     paddingLeft: theme.spacing(2),
// //     paddingRight: theme.spacing(1),
// //   },
// //   highlight:
// //     theme.palette.type === "light"
// //       ? {
// //           color: theme.palette.secondary.main,
// //           backgroundColor: lighten(theme.palette.secondary.light, 0.85),
// //         }
// //       : {
// //           color: theme.palette.text.primary,
// //           backgroundColor: theme.palette.secondary.dark,
// //         },
// //   title: {
// //     flex: "1 1 100%",
// //   },
// // }));

// // const EnhancedTableToolbar = (props) => {
// //   const classes = useToolbarStyles();

// //   return (
// //     <Toolbar>
// //       <Typography
// //         className={classes.title}
// //         variant="h6"
// //         id="tableTitle"
// //         component="div"
// //       >
// //         Trending by US State
// //       </Typography>
// //       <FormControlLabel
// //         control={
// //           <Switch
// //             checked={props.isBackgroundColored}
// //             onChange={props.handleChangeIsBackgroundColored}
// //           />
// //         }
// //         label="Background colors"
// //       />
// //       <FormControlLabel
// //         control={
// //           <Switch checked={props.dense} onChange={props.handleChangeDense} />
// //         }
// //         label="Dense padding"
// //       />
// //       <Tooltip title="Filter list">
// //         <IconButton aria-label="filter list">
// //           <FilterListIcon />
// //         </IconButton>
// //       </Tooltip>
// //     </Toolbar>
// //   );
// // };

// // const useStyles = makeStyles((theme) => ({
// //   root: {
// //     width: "100%",
// //   },
// //   paper: {
// //     width: "100%",
// //     marginBottom: theme.spacing(2),
// //   },
// //   table: {
// //     minWidth: 750,
// //   },
// //   visuallyHidden: {
// //     border: 0,
// //     clip: "rect(0 0 0 0)",
// //     height: 1,
// //     margin: -1,
// //     overflow: "hidden",
// //     padding: 0,
// //     position: "absolute",
// //     top: 20,
// //     width: 1,
// //   },
// // }));

// // export default function EnhancedTable({ dailyTrends, colorsByTopic }) {
// //   const classes = useStyles();
// //   const [order, setOrder] = React.useState("asc");
// //   const [orderBy, setOrderBy] = React.useState("calories");
// //   const [selected, setSelected] = React.useState([]);
// //   const [page, setPage] = React.useState(0);
// //   const [dense, setDense] = React.useState(true);
// //   const [rowsPerPage, setRowsPerPage] = React.useState(dailyTrends.size);
// //   const [isBackgroundColored, setIsBackgroundColored] = React.useState(false);

// //   if (!dailyTrends) {
// //     return "Loading...";
// //   }

// //   const rows = [];

// //   dailyTrends.forEach((value, key) => {
// //     const topics = [];

// //     value.forEach((topic) => {
// //       topics.push(topic.topic);
// //     });

// //     rows.push({
// //       name: key,
// //       ...topics,
// //       cellStyle: {
// //         backgroundColor: "red",
// //       },
// //     });
// //   });

// //   rows.sort((a, b) => {
// //     if (a.name < b.name) return -1;
// //     if (a.name > b.name) return 1;
// //     return 0;
// //   });

// //   const handleRequestSort = (event, property) => {
// //     const isAsc = orderBy === property && order === "asc";
// //     setOrder(isAsc ? "desc" : "asc");
// //     setOrderBy(property);
// //   };

// //   const handleSelectAllClick = (event) => {
// //     if (event.target.checked) {
// //       const newSelecteds = rows.map((n) => n.name);
// //       setSelected(newSelecteds);
// //       return;
// //     }
// //     setSelected([]);
// //   };

// //   const handleClick = (event, name) => {
// //     const selectedIndex = selected.indexOf(name);
// //     let newSelected = [];

// //     if (selectedIndex === -1) {
// //       newSelected = newSelected.concat(selected, name);
// //     } else if (selectedIndex === 0) {
// //       newSelected = newSelected.concat(selected.slice(1));
// //     } else if (selectedIndex === selected.length - 1) {
// //       newSelected = newSelected.concat(selected.slice(0, -1));
// //     } else if (selectedIndex > 0) {
// //       newSelected = newSelected.concat(
// //         selected.slice(0, selectedIndex),
// //         selected.slice(selectedIndex + 1)
// //       );
// //     }

// //     setSelected(newSelected);
// //   };

// //   const handleChangePage = (event, newPage) => {
// //     setPage(newPage);
// //   };

// //   const handleChangeRowsPerPage = (event) => {
// //     setRowsPerPage(parseInt(event.target.value, 10));
// //     setPage(0);
// //   };

// //   const handleChangeDense = (event) => {
// //     setDense(event.target.checked);
// //   };

// //   function handleChangeIsBackgroundColored(event) {
// //     setIsBackgroundColored(event.target.checked);
// //   }

// //   const emptyRows =
// //     rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

// //   console.log("head/rows", headCells, rows);

// //   return (
// //     <div className={classes.root}>
// //       <Typography paragraph>
// //         Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
// //         tempor incididunt ut labore et dolore magna aliqua. Rhoncus dolor purus
// //         non enim praesent elementum facilisis leo vel. Risus at ultrices mi
// //         tempus imperdiet. Semper risus in hendrerit gravida rutrum quisque non
// //         tellus. Convallis convallis tellus id interdum velit laoreet id donec
// //         ultrices. Odio morbi quis commodo odio aenean sed adipiscing. Amet nisl
// //         suscipit adipiscing bibendum est ultricies integer quis. Cursus euismod
// //         quis viverra nibh cras. Metus vulputate eu scelerisque felis imperdiet
// //         proin fermentum leo. Mauris commodo quis imperdiet massa tincidunt. Cras
// //         tincidunt lobortis feugiat vivamus at augue. At augue eget arcu dictum
// //         varius duis at consectetur lorem. Velit sed ullamcorper morbi tincidunt.
// //         Lorem donec massa sapien faucibus et molestie ac.
// //       </Typography>
// //       <Paper className={classes.paper}>
// //         <MaterialTable
// //           title="Google Trends - USA"
// //           icons={{
// //             Filter: () => <div />,
// //             Export: () => <GetAppIcon />,
// //           }}
// //           columns={headCells}
// //           data={rows}
// //           options={{
// //             search: false,
// //             exportButton: true,
// //             filtering: true,
// //           }}
// //         />
// //       </Paper>
// //       <Paper className={classes.paper}>
// //         <EnhancedTableToolbar
// //           dense={dense}
// //           handleChangeDense={handleChangeDense}
// //           isBackgroundColored={isBackgroundColored}
// //           handleChangeIsBackgroundColored={handleChangeIsBackgroundColored}
// //         />
// //         {/* <TableContainer>
// //           <Table
// //             className={classes.table}
// //             aria-labelledby="tableTitle"
// //             size={dense ? "small" : "medium"}
// //             aria-label="sticky table"
// //             stickyHeader
// //           >
// //             <EnhancedTableHead
// //               classes={classes}
// //               order={order}
// //               orderBy={orderBy}
// //               onSelectAllClick={handleSelectAllClick}
// //               onRequestSort={handleRequestSort}
// //               rowCount={rows.length}
// //             />
// //             <TableBody>
// //               {stableSort(rows, getComparator(order, orderBy))
// //                 .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
// //                 .map((row, index) => {
// //                   const labelId = `enhanced-table-cell-${index}`;
// //                   const style = isBackgroundColored
// //                     ? {
// //                         backgroundColor: colorsByTopic.get(row[0]),
// //                         color: invert(colorsByTopic.get(row[0]), true),
// //                       }
// //                     : {};

// //                   // TODO: make rows dynamic!
// //                   return (
// //                     <TableRow
// //                       hover
// //                       onClick={(event) => handleClick(event, row.name)}
// //                       tabIndex={-1}
// //                       key={row.name}
// //                     >
// //                       <TableCell component="th" id={labelId} scope="row">
// //                         {row.name}
// //                       </TableCell>
// //                       <TableCell align="left" style={style}>
// //                         {row[0]}
// //                       </TableCell>
// //                       <TableCell
// //                         align="left"
// //                         style={{
// //                           backgroundColor: colorsByTopic.get(row[1]),
// //                           color: invert(colorsByTopic.get(row[1]), true),
// //                         }}
// //                       >
// //                         {row[1]}
// //                       </TableCell>
// //                       <TableCell
// //                         align="left"
// //                         style={{
// //                           backgroundColor: colorsByTopic.get(row[2]),
// //                           color: invert(colorsByTopic.get(row[2]), true),
// //                         }}
// //                       >
// //                         {row[2]}
// //                       </TableCell>
// //                       <TableCell
// //                         align="left"
// //                         style={{
// //                           backgroundColor: colorsByTopic.get(row[3]),
// //                           color: invert(colorsByTopic.get(row[3]), true),
// //                         }}
// //                       >
// //                         {row[3]}
// //                       </TableCell>
// //                       <TableCell
// //                         align="left"
// //                         style={{
// //                           backgroundColor: colorsByTopic.get(row[4]),
// //                           color: invert(colorsByTopic.get(row[4]), true),
// //                         }}
// //                       >
// //                         {row[4]}
// //                       </TableCell>
// //                       <TableCell
// //                         align="left"
// //                         style={{
// //                           backgroundColor: colorsByTopic.get(row[5]),
// //                           color: invert(colorsByTopic.get(row[5]), true),
// //                         }}
// //                       >
// //                         {row[5]}
// //                       </TableCell>
// //                       <TableCell
// //                         align="left"
// //                         style={{
// //                           backgroundColor: colorsByTopic.get(row[6]),
// //                           color: invert(colorsByTopic.get(row[6]), true),
// //                         }}
// //                       >
// //                         {row[6]}
// //                       </TableCell>
// //                       <TableCell
// //                         align="left"
// //                         style={{
// //                           backgroundColor: colorsByTopic.get(row[7]),
// //                           color: invert(colorsByTopic.get(row[7]), true),
// //                         }}
// //                       >
// //                         {row[7]}
// //                       </TableCell>
// //                       <TableCell
// //                         align="left"
// //                         style={{
// //                           backgroundColor: colorsByTopic.get(row[8]),
// //                           color: invert(colorsByTopic.get(row[8]), true),
// //                         }}
// //                       >
// //                         {row[8]}
// //                       </TableCell>
// //                       <TableCell
// //                         align="left"
// //                         style={{
// //                           backgroundColor: colorsByTopic.get(row[9]),
// //                           color: invert(colorsByTopic.get(row[9]), true),
// //                         }}
// //                       >
// //                         {row[9]}
// //                       </TableCell>
// //                     </TableRow>
// //                   );
// //                 })}
// //               {emptyRows > 0 && (
// //                 <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
// //                   <TableCell colSpan={6} />
// //                 </TableRow>
// //               )}
// //             </TableBody>
// //           </Table>
// //         </TableContainer> */}
// //         <TablePagination
// //           rowsPerPageOptions={[5, 10, 25, 50, 51]}
// //           component="div"
// //           count={rows.length}
// //           rowsPerPage={rowsPerPage}
// //           page={page}
// //           onChangePage={handleChangePage}
// //           onChangeRowsPerPage={handleChangeRowsPerPage}
// //         />
// //       </Paper>
// //     </div>
// //   );
// // }

// const Styles = styled.div`
//   padding: 1rem;
//   table {
//     border-spacing: 0;
//     border: 1px solid black;
//     tr {
//       :last-child {
//         td {
//           border-bottom: 0;
//         }
//       }
//     }
//     th,
//     td {
//       margin: 0;
//       padding: 0.5rem;
//       border-bottom: 1px solid black;
//       border-right: 1px solid black;
//       :last-child {
//         border-right: 0;
//       }
//     }
//     td {
//       input {
//         font-size: 1rem;
//         padding: 0;
//         margin: 0;
//         border: 0;
//       }
//     }
//   }
//   .pagination {
//     padding: 0.5rem;
//   }
// `;

// // Create an editable cell renderer
// const EditableCell = ({
//   value: initialValue,
//   row: { index },
//   column: { id },
//   updateMyData, // This is a custom function that we supplied to our table instance
//   editable,
// }) => {
//   // We need to keep and update the state of the cell normally
//   const [value, setValue] = React.useState(initialValue);

//   const onChange = (e) => {
//     setValue(e.target.value);
//   };

//   // We'll only update the external data when the input is blurred
//   const onBlur = () => {
//     updateMyData(index, id, value);
//   };

//   // If the initialValue is changed externall, sync it up with our state
//   React.useEffect(() => {
//     setValue(initialValue);
//   }, [initialValue]);

//   if (!editable) {
//     return `${initialValue}`;
//   }

//   return <input value={value} onChange={onChange} onBlur={onBlur} />;
// };

// // Define a default UI for filtering
// function DefaultColumnFilter({
//   column: { filterValue, preFilteredRows, setFilter },
// }) {
//   const count = preFilteredRows.length;

//   return (
//     <input
//       value={filterValue || ""}
//       onChange={(e) => {
//         setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
//       }}
//       placeholder={`Search ${count} records...`}
//     />
//   );
// }

// // This is a custom filter UI for selecting
// // a unique option from a list
// function SelectColumnFilter({
//   column: { filterValue, setFilter, preFilteredRows, id },
// }) {
//   // Calculate the options for filtering
//   // using the preFilteredRows
//   const options = React.useMemo(() => {
//     const options = new Set();
//     preFilteredRows.forEach((row) => {
//       options.add(row.values[id]);
//     });
//     return [...options.values()];
//   }, [id, preFilteredRows]);

//   // Render a multi-select box
//   return (
//     <select
//       value={filterValue}
//       onChange={(e) => {
//         setFilter(e.target.value || undefined);
//       }}
//     >
//       <option value="">All</option>
//       {options.map((option, i) => (
//         <option key={i} value={option}>
//           {option}
//         </option>
//       ))}
//     </select>
//   );
// }

// // This is a custom filter UI that uses a
// // slider to set the filter value between a column's
// // min and max values
// function SliderColumnFilter({
//   column: { filterValue, setFilter, preFilteredRows, id },
// }) {
//   // Calculate the min and max
//   // using the preFilteredRows

//   const [min, max] = React.useMemo(() => {
//     let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
//     let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
//     preFilteredRows.forEach((row) => {
//       min = Math.min(row.values[id], min);
//       max = Math.max(row.values[id], max);
//     });
//     return [min, max];
//   }, [id, preFilteredRows]);

//   return (
//     <>
//       <input
//         type="range"
//         min={min}
//         max={max}
//         value={filterValue || min}
//         onChange={(e) => {
//           setFilter(parseInt(e.target.value, 10));
//         }}
//       />
//       <button onClick={() => setFilter(undefined)}>Off</button>
//     </>
//   );
// }

// // This is a custom UI for our 'between' or number range
// // filter. It uses two number boxes and filters rows to
// // ones that have values between the two
// function NumberRangeColumnFilter({
//   column: { filterValue = [], preFilteredRows, setFilter, id },
// }) {
//   const [min, max] = React.useMemo(() => {
//     let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
//     let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
//     preFilteredRows.forEach((row) => {
//       min = Math.min(row.values[id], min);
//       max = Math.max(row.values[id], max);
//     });
//     return [min, max];
//   }, [id, preFilteredRows]);

//   return (
//     <div
//       style={{
//         display: "flex",
//       }}
//     >
//       <input
//         value={filterValue[0] || ""}
//         type="number"
//         onChange={(e) => {
//           const val = e.target.value;
//           setFilter((old = []) => [
//             val ? parseInt(val, 10) : undefined,
//             old[1],
//           ]);
//         }}
//         placeholder={`Min (${min})`}
//         style={{
//           width: "70px",
//           marginRight: "0.5rem",
//         }}
//       />
//       to
//       <input
//         value={filterValue[1] || ""}
//         type="number"
//         onChange={(e) => {
//           const val = e.target.value;
//           setFilter((old = []) => [
//             old[0],
//             val ? parseInt(val, 10) : undefined,
//           ]);
//         }}
//         placeholder={`Max (${max})`}
//         style={{
//           width: "70px",
//           marginLeft: "0.5rem",
//         }}
//       />
//     </div>
//   );
// }

// function fuzzyTextFilterFn(rows, id, filterValue) {
//   return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
// }

// // Let the table remove the filter if the string is empty
// fuzzyTextFilterFn.autoRemove = (val) => !val;

// // Be sure to pass our updateMyData and the skipReset option
// function Table({ columns, data, updateMyData, skipReset }) {
//   const filterTypes = React.useMemo(
//     () => ({
//       // Add a new fuzzyTextFilterFn filter type.
//       fuzzyText: fuzzyTextFilterFn,
//       // Or, override the default text filter to use
//       // "startWith"
//       text: (rows, id, filterValue) => {
//         return rows.filter((row) => {
//           const rowValue = row.values[id];
//           return rowValue !== undefined
//             ? String(rowValue)
//                 .toLowerCase()
//                 .startsWith(String(filterValue).toLowerCase())
//             : true;
//         });
//       },
//     }),
//     []
//   );

//   const defaultColumn = React.useMemo(
//     () => ({
//       // Let's set up our default Filter UI
//       Filter: DefaultColumnFilter,
//       // And also our default editable cell
//       Cell: EditableCell,
//     }),
//     []
//   );

//   // Use the state and functions returned from useTable to build your UI
//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     prepareRow,
//     page, // Instead of using 'rows', we'll use page,
//     // which has only the rows for the active page

//     // The rest of these things are super handy, too ;)
//     canPreviousPage,
//     canNextPage,
//     pageOptions,
//     pageCount,
//     gotoPage,
//     nextPage,
//     previousPage,
//     setPageSize,
//     state: {
//       pageIndex,
//       pageSize,
//       sortBy,
//       groupBy,
//       expanded,
//       filters,
//       selectedRowIds,
//     },
//   } = useTable(
//     {
//       columns,
//       data,
//       defaultColumn,
//       filterTypes,
//       // updateMyData isn't part of the API, but
//       // anything we put into these options will
//       // automatically be available on the instance.
//       // That way we can call this function from our
//       // cell renderer!
//       updateMyData,
//       // We also need to pass this so the page doesn't change
//       // when we edit the data.
//       autoResetPage: !skipReset,
//       autoResetSelectedRows: !skipReset,
//       disableMultiSort: true,
//     },
//     useFilters,
//     useGroupBy,
//     useSortBy,
//     useExpanded,
//     usePagination,
//     useRowSelect,
//     // Here we will use a plugin to add our selection column
//     (hooks) => {
//       hooks.visibleColumns.push((columns) => {
//         return [
//           {
//             id: "selection",
//             // Make this column a groupByBoundary. This ensures that groupBy columns
//             // are placed after it
//             groupByBoundary: true,
//             // The header can use the table's getToggleAllRowsSelectedProps method
//             // to render a checkbox
//             Header: ({ getToggleAllRowsSelectedProps }) => (
//               <div>
//                 <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
//               </div>
//             ),
//             // The cell can use the individual row's getToggleRowSelectedProps method
//             // to the render a checkbox
//             Cell: ({ row }) => (
//               <div>
//                 <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
//               </div>
//             ),
//           },
//           ...columns,
//         ];
//       });
//     }
//   );

//   // Render the UI for your table
//   return (
//     <>
//       <table {...getTableProps()}>
//         <thead>
//           {headerGroups.map((headerGroup) => (
//             <tr {...headerGroup.getHeaderGroupProps()}>
//               {headerGroup.headers.map((column) => (
//                 <th {...column.getHeaderProps()}>
//                   <div>
//                     {column.canGroupBy ? (
//                       // If the column can be grouped, let's add a toggle
//                       <span {...column.getGroupByToggleProps()}>
//                         {column.isGrouped ? "🛑 " : "👊 "}
//                       </span>
//                     ) : null}
//                     <span {...column.getSortByToggleProps()}>
//                       {column.render("Header")}
//                       {/* Add a sort direction indicator */}
//                       {column.isSorted
//                         ? column.isSortedDesc
//                           ? " 🔽"
//                           : " 🔼"
//                         : ""}
//                     </span>
//                   </div>
//                   {/* Render the columns filter UI */}
//                   <div>{column.canFilter ? column.render("Filter") : null}</div>
//                 </th>
//               ))}
//             </tr>
//           ))}
//         </thead>
//         <tbody {...getTableBodyProps()}>
//           {page.map((row) => {
//             prepareRow(row);
//             return (
//               <tr {...row.getRowProps()}>
//                 {row.cells.map((cell) => {
//                   return (
//                     <td {...cell.getCellProps()}>
//                       {cell.isGrouped ? (
//                         // If it's a grouped cell, add an expander and row count
//                         <>
//                           <span {...row.getToggleRowExpandedProps()}>
//                             {row.isExpanded ? "👇" : "👉"}
//                           </span>{" "}
//                           {cell.render("Cell", { editable: false })} (
//                           {row.subRows.length})
//                         </>
//                       ) : cell.isAggregated ? (
//                         // If the cell is aggregated, use the Aggregated
//                         // renderer for cell
//                         cell.render("Aggregated")
//                       ) : cell.isPlaceholder ? null : ( // For cells with repeated values, render null
//                         // Otherwise, just render the regular cell
//                         cell.render("Cell", { editable: true })
//                       )}
//                     </td>
//                   );
//                 })}
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//       {/*
//         Pagination can be built however you'd like.
//         This is just a very basic UI implementation:
//       */}
//       <div className="pagination">
//         <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
//           {"<<"}
//         </button>{" "}
//         <button onClick={() => previousPage()} disabled={!canPreviousPage}>
//           {"<"}
//         </button>{" "}
//         <button onClick={() => nextPage()} disabled={!canNextPage}>
//           {">"}
//         </button>{" "}
//         <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
//           {">>"}
//         </button>{" "}
//         <span>
//           Page{" "}
//           <strong>
//             {pageIndex + 1} of {pageOptions.length}
//           </strong>{" "}
//         </span>
//         <span>
//           | Go to page:{" "}
//           <input
//             type="number"
//             defaultValue={pageIndex + 1}
//             onChange={(e) => {
//               const page = e.target.value ? Number(e.target.value) - 1 : 0;
//               gotoPage(page);
//             }}
//             style={{ width: "100px" }}
//           />
//         </span>{" "}
//         <select
//           value={pageSize}
//           onChange={(e) => {
//             setPageSize(Number(e.target.value));
//           }}
//         >
//           {[10, 20, 30, 40, 50].map((pageSize) => (
//             <option key={pageSize} value={pageSize}>
//               Show {pageSize}
//             </option>
//           ))}
//         </select>
//       </div>
//       <pre>
//         <code>
//           {JSON.stringify(
//             {
//               pageIndex,
//               pageSize,
//               pageCount,
//               canNextPage,
//               canPreviousPage,
//               sortBy,
//               groupBy,
//               expanded: expanded,
//               filters,
//               selectedRowIds: selectedRowIds,
//             },
//             null,
//             2
//           )}
//         </code>
//       </pre>
//     </>
//   );
// }

// // Define a custom filter filter function!
// function filterGreaterThan(rows, id, filterValue) {
//   return rows.filter((row) => {
//     const rowValue = row.values[id];
//     return rowValue >= filterValue;
//   });
// }

// // This is an autoRemove method on the filter function that
// // when given the new filter value and returns true, the filter
// // will be automatically removed. Normally this is just an undefined
// // check, but here, we want to remove the filter if it's not a number
// filterGreaterThan.autoRemove = (val) => typeof val !== "number";

// // This is a custom aggregator that
// // takes in an array of leaf values and
// // returns the rounded median
// function roundedMedian(leafValues) {
//   let min = leafValues[0] || 0;
//   let max = leafValues[0] || 0;

//   leafValues.forEach((value) => {
//     min = Math.min(min, value);
//     max = Math.max(max, value);
//   });

//   return Math.round((min + max) / 2);
// }

// const IndeterminateCheckbox = React.forwardRef(
//   ({ indeterminate, ...rest }, ref) => {
//     const defaultRef = React.useRef();
//     const resolvedRef = ref || defaultRef;

//     React.useEffect(() => {
//       resolvedRef.current.indeterminate = indeterminate;
//     }, [resolvedRef, indeterminate]);

//     return (
//       <>
//         <input type="checkbox" ref={resolvedRef} {...rest} />
//       </>
//     );
//   }
// );

// function App() {
//   const columns = React.useMemo(
//     () => [
//       {
//         Header: "Name",
//         columns: [
//           {
//             Header: "First Name",
//             accessor: "firstName",
//             // Use a two-stage aggregator here to first
//             // count the total rows being aggregated,
//             // then sum any of those counts if they are
//             // aggregated further
//             aggregate: "count",
//             Aggregated: ({ value }) => `${value} Names`,
//           },
//           {
//             Header: "Last Name",
//             accessor: "lastName",
//             // Use our custom `fuzzyText` filter on this column
//             filter: "fuzzyText",
//             // Use another two-stage aggregator here to
//             // first count the UNIQUE values from the rows
//             // being aggregated, then sum those counts if
//             // they are aggregated further
//             aggregate: "uniqueCount",
//             Aggregated: ({ value }) => `${value} Unique Names`,
//           },
//         ],
//       },
//       {
//         Header: "Info",
//         columns: [
//           {
//             Header: "Age",
//             accessor: "age",
//             Filter: SliderColumnFilter,
//             filter: "equals",
//             // Aggregate the average age of visitors
//             aggregate: "average",
//             Aggregated: ({ value }) => `${value} (avg)`,
//           },
//           {
//             Header: "Visits",
//             accessor: "visits",
//             Filter: NumberRangeColumnFilter,
//             filter: "between",
//             // Aggregate the sum of all visits
//             aggregate: "sum",
//             Aggregated: ({ value }) => `${value} (total)`,
//           },
//           {
//             Header: "Status",
//             accessor: "status",
//             Filter: SelectColumnFilter,
//             filter: "includes",
//           },
//           {
//             Header: "Profile Progress",
//             accessor: "progress",
//             Filter: SliderColumnFilter,
//             filter: filterGreaterThan,
//             // Use our custom roundedMedian aggregator
//             aggregate: roundedMedian,
//             Aggregated: ({ value }) => `${value} (med)`,
//           },
//         ],
//       },
//     ],
//     []
//   );

//   const [data, setData] = React.useState(() => makeData(10000));
//   const [originalData] = React.useState(data);

//   // We need to keep the table from resetting the pageIndex when we
//   // Update data. So we can keep track of that flag with a ref.
//   const skipResetRef = React.useRef(false);

//   // When our cell renderer calls updateMyData, we'll use
//   // the rowIndex, columnId and new value to update the
//   // original data
//   const updateMyData = (rowIndex, columnId, value) => {
//     // We also turn on the flag to not reset the page
//     skipResetRef.current = true;
//     setData((old) =>
//       old.map((row, index) => {
//         if (index === rowIndex) {
//           return {
//             ...row,
//             [columnId]: value,
//           };
//         }
//         return row;
//       })
//     );
//   };

//   // After data changes, we turn the flag back off
//   // so that if data actually changes when we're not
//   // editing it, the page is reset
//   React.useEffect(() => {
//     skipResetRef.current = false;
//   }, [data]);

//   // Let's add a data resetter/randomizer to help
//   // illustrate that flow...
//   const resetData = () => {
//     // Don't reset the page when we do this
//     skipResetRef.current = true;
//     setData(originalData);
//   };

//   return (
//     <Styles>
//       <button onClick={resetData}>Reset Data</button>
//       <Table
//         columns={columns}
//         data={data}
//         updateMyData={updateMyData}
//         skipReset={skipResetRef.current}
//       />
//     </Styles>
//   );
// }

// export default App;
export default function () {
  return <div></div>;
}
