import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";

function getModalStyle() {
  const top = 0;
  const left = 0;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    width: "80vh",
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    overflowY: "scroll",
    maxHeight: "80vh",
  },
}));

export default function TopicDetailModal(props) {
  const { topic, rank } = props;
  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  function ModalBody({ article, topic, rank }) {
    if (!topic) {
      return <div>Not Found</div>;
    }

    return (
      <div style={modalStyle} className={classes.paper}>
        <h2 id="simple-modal-title">
          {rank} {topic?.title?.query} ({topic?.formattedTraffic})
        </h2>
        {/* <p id="simple-modal-description">
          Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
        </p> */}
        <ListItem>
          <ListItemText>
            <div>{article.image?.imageUrl}</div>
            <div>{article.image?.newsUrl}</div>
            <div>{article.image?.source}</div>
            <div>{article.snippet}</div>
            <div>{article.source}</div>
            <div>{article.timeAgo}</div>
            <div>{article.title}</div>
            <div>{article.url}</div>
          </ListItemText>
        </ListItem>
      </div>
    );
  }

  console.log(`Topic #${rank}`, topic);

  // TOOD: validate incoming topic properties?

  if (!topic) {
    return <ListItem>Not found</ListItem>;
  }

  return (
    <ListItem>
      <ListItemText type="button" onClick={handleOpen}>
        {rank} {topic?.title?.query} ({topic?.formattedTraffic})
      </ListItemText>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <List>
          <div style={modalStyle} className={classes.paper}>
            <h2 id="simple-modal-title">
              {rank} {topic?.title?.query} ({topic?.formattedTraffic})
            </h2>
            {topic.articles.map((article, i) => (
              <ListItem>
                <ListItemText>
                  <div>
                    Article #{i + 1}/{topic.articles.length}
                  </div>
                  <div>{article.image?.imageUrl}</div>
                  <div>{article.image?.newsUrl}</div>
                  <div>{article.image?.source}</div>
                  <div>{article.snippet}</div>
                  <div>{article.source}</div>
                  <div>{article.timeAgo}</div>
                  <div>{article.title}</div>
                  <div>{article.url}</div>
                </ListItemText>
              </ListItem>
            ))}
            {/* <p id="simple-modal-description">
              Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
            </p> */}
          </div>
        </List>
      </Modal>
    </ListItem>
  );
}
