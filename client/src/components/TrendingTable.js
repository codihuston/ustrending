import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Box from "@material-ui/core/Box";

import TopicDetailModal from "./TopicDetailModal";

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

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

// function Row(props) {
//   const classes = useRowStyles();
//   const { row, index } = props;

//   return (
//     <React.Fragment>
//       <TableRow className={classes.root}>
//         <TableCell component="th" scope="row">
//           <Link href={row.shareUrl}>
//             {index + 1} {row.title.query} ({row.formattedTraffic})
//           </Link>
//         </TableCell>
//         <TableCell width="5%">
//           <IconButton
//             aria-label="expand row"
//             size="small"
//             onClick={() => setOpen(!open)}
//           >
//             {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
//           </IconButton>
//         </TableCell>
//       </TableRow>
//       <TableRow>
//         <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
//           <Collapse in={open} timeout="auto" unmountOnExit>
//             <Box margin={1}>
//               <Typography variant="h6" gutterBottom component="div">
//                 Articles
//               </Typography>
//               {row.articles.map((articleRow) => (
//                 <Link key={articleRow.url} href={articleRow.url}>
//                   {articleRow.source}
//                 </Link>
//               ))}
//             </Box>
//           </Collapse>
//         </TableCell>
//       </TableRow>
//     </React.Fragment>
//   );
// }

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
    <Box maxWidth="25%">
      <List>
        {rows.map((row, i) => (
          // <Row key={row.title.query} row={row} index={i}></Row>

          <TopicDetailModal topic={row} rank={i} />
        ))}
      </List>
    </Box>
  );
};

export default TrendingTable;
