import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
  },
}));

const TrendingTable = ({ dailyTrends, handleOpen }) => {
  const classes = useStyles();
  const rows = dailyTrends;

  return (
    <div className={classes.root}>
      <List aria-label="Top Google Trending Topics">
        {rows.map((topic, rank) => (
          <ListItem className="cursor-pointer" key={topic?.title?.query}>
            <ListItemText type="button" onClick={(e) => handleOpen(e, rank)}>
              {rank + 1} {topic?.title?.query} ({topic?.formattedTraffic})
            </ListItemText>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default TrendingTable;
