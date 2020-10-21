import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import ArticleDetailCard from "./ArticleDetailCard";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    width: "80vh",
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 4, 3),
    overflowY: "scroll",
    maxHeight: "90vh",
    outline: "none",
    borderRadius: "3px",
  },
  closeButton: {
    position: "absolute",
    top: "8px",
    right: "16px",
    fontSize: "18px",
  },
}));

export default function TopicDetailModal(props) {
  const { topic, rank } = props;
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!topic) {
    return <ListItem>Not found</ListItem>;
  }

  return (
    <ListItem className="cursor-pointer">
      <ListItemText type="button" onClick={handleOpen}>
        {rank + 1} {topic?.title?.query} ({topic?.formattedTraffic})
      </ListItemText>
      <Modal
        open={open}
        onClose={handleClose}
        className={classes.modal}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className={classes.paper}>
          <Box textAlign="center" mb={3}>
            <Typography component="h5" variant="h5">
              Trending #{rank + 1}: {topic?.title?.query} (
              {topic?.formattedTraffic})
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Tap outside of the modal to close it.
            </Typography>
            <button className={classes.closeButton} onClick={handleClose}>
              Close
            </button>
          </Box>
          {topic.articles.map((article, i) => (
            <Box mb={2} key={article.title?.query ? article.title?.query : i}>
              <ArticleDetailCard
                article={article}
                number={i}
              ></ArticleDetailCard>
            </Box>
          ))}
        </div>
      </Modal>
    </ListItem>
  );
}
