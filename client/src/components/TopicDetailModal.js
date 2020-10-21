import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {
  EmailShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  RedditShareButton,
  TwitterShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  RedditIcon,
  EmailIcon,
  FacebookShareCount,
  RedditShareCount,
} from "react-share";

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
                  <div>
                    <img src={article.image?.imageUrl} />
                  </div>
                  <div>
                    {article.image?.source}:
                    <a href={article.url}>{article.title}</a>
                    {/* <div>{article.image?.newsUrl}</div> */}
                  </div>
                  <div>{article.timeAgo}</div>
                  <div>{article.snippet}</div>
                  <div>
                    <EmailShareButton
                      url={article.url}
                      subject={article.title}
                      body="body"
                      className="Demo__some-network__share-button"
                    >
                      <EmailIcon size={32} round />
                    </EmailShareButton>
                  </div>
                  <div className="Demo__some-network">
                    <FacebookShareButton
                      url={article.url}
                      quote={article.title}
                      className="Demo__some-network__share-button"
                    >
                      <FacebookIcon size={32} round />
                    </FacebookShareButton>

                    <div>
                      <FacebookShareCount
                        url={article.url}
                        className="Demo__some-network__share-count"
                      >
                        {(count) => count}
                      </FacebookShareCount>
                    </div>
                    <div>
                      <div className="Demo__some-network">
                        <RedditShareButton
                          url={article.url}
                          title={article.title}
                          windowWidth={660}
                          windowHeight={460}
                          className="Demo__some-network__share-button"
                        >
                          <RedditIcon size={32} round />
                        </RedditShareButton>

                        <div>
                          <RedditShareCount
                            url={article.url}
                            className="Demo__some-network__share-count"
                          />
                        </div>
                      </div>
                      <div className="Demo__some-network">
                        <LinkedinShareButton
                          url={article.url}
                          className="Demo__some-network__share-button"
                        >
                          <LinkedinIcon size={32} round />
                        </LinkedinShareButton>
                      </div>

                      <div className="Demo__some-network">
                        <TwitterShareButton
                          url={article.url}
                          title={article.title}
                          className="Demo__some-network__share-button"
                        >
                          <TwitterIcon size={32} round />
                        </TwitterShareButton>

                        <div className="Demo__some-network__share-count">
                          &nbsp;
                        </div>
                      </div>
                    </div>
                  </div>
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
