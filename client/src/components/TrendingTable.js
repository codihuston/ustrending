import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Link from "@material-ui/core/Link";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Box from "@material-ui/core/Box";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";

const useRowStyles = makeStyles({
  root: {
    "& > *": {
      borderBottom: "unset",
    },
  },
});

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function Row(props) {
  const { row, index } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useRowStyles();

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell component="th" scope="row">
          <Link href={row.shareUrl}>
            {index + 1} {row.title.query} ({row.formattedTraffic})
          </Link>
        </TableCell>
        <TableCell width="5%">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                Articles
              </Typography>
              {row.articles.map((articleRow) => (
                <Link key={articleRow.url} href={articleRow.url}>
                  {articleRow.source}
                </Link>
              ))}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const TrendingTable = ({ dailyTrends }) => {
  console.log("Daily Trends", dailyTrends);
  const classes = useStyles();
  const rows = dailyTrends;
  // TODO: generate this dynamically
  const columns = React.useMemo(
    () => [
      {
        Header: "State",
        accessor: "name",
      },
    ],
    []
  );

  return (
    <>
      <TableContainer>
        <Table className={classes.table} aria-label="simple table">
          <TableBody>
            {rows.map((row, i) => (
              <Row key={row.title.query} row={row} index={i}></Row>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default TrendingTable;
