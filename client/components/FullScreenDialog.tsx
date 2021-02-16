import React, { useEffect } from "react";
import { TransitionProps } from "@material-ui/core/transitions";
import { makeStyles } from "@material-ui/core/styles";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
  Slide,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

import { GoogleDailyTrend } from "../types";
import { ArticleDetailCard } from "./ArticleDetailCard";

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

const Transition = React.forwardRef<unknown, TransitionProps>(
  function Transition(props: TransitionProps, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  }
);

type Props = {
  googleDailyTrends: GoogleDailyTrend[];
  selectedTrend: string;
  handleCloseDialog();
};

export function FullScreenDialog({
  googleDailyTrends,
  handleCloseDialog,
  selectedTrend,
}: Props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(selectedTrend ? true : false);

  useEffect(() => {
    setOpen(selectedTrend ? true : false);
  }, [googleDailyTrends, selectedTrend]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    handleCloseDialog();
  };

  if (!googleDailyTrends) return null;

  const articles = googleDailyTrends
    .filter((trend) => trend.title.query === selectedTrend)
    .map((trend) => {
      return trend.articles.map((article) => {
        return (
          <ListItem>
            <ArticleDetailCard article={article} />
          </ListItem>
        );
      });
    });

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Open full-screen dialog
      </Button>
      <Dialog
        // fullScreen
        fullWidth
        maxWidth={"lg"}
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              News for "{selectedTrend}"
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              Exit
            </Button>
          </Toolbar>
        </AppBar>
        <List>
          {/* TODO: if given googleRealtimeTrends, need to parse those differently! */}
          {articles.length > 0 ? (
            articles
          ) : (
            <ListItem button onClick={handleClose}>
              <ListItemText>
                <Box textAlign="center">No articles found!</Box>
              </ListItemText>
            </ListItem>
          )}
          <Divider />
          <ListItem>
            <ListItemText>
              <Box textAlign="center">
                Articles are sourced from{" "}
                <a href="https://trends.google.com/">Google Trends</a>
              </Box>
            </ListItemText>
          </ListItem>
        </List>
      </Dialog>
    </div>
  );
}
