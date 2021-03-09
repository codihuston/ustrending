import React, { useEffect } from "react";
import { TransitionProps } from "@material-ui/core/transitions";
import { makeStyles } from "@material-ui/core/styles";
import { Alert } from "@material-ui/lab";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  Divider,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  Theme,
  Toolbar,
  Typography,
  Slide,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

import { GoogleRealtimeTrendArticle } from "../types";
import GoogleRealtimeTrendArticleCard from "./GoogleRealtimeTrendArticleCard";

const useStyles = makeStyles((theme: Theme) => ({
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
  googleTrendsUrl: string;
  googleTrendsUrlQueryToken: string;
  handleCloseDialog();
  relatedArticles: GoogleRealtimeTrendArticle[];
  selectedTrend: string;
};

export default function GoogleRealtimeTrendArticleDialog({
  googleTrendsUrl,
  googleTrendsUrlQueryToken,
  handleCloseDialog,
  relatedArticles,
  selectedTrend,
}: Props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(selectedTrend ? true : false);

  useEffect(() => {
    setOpen(selectedTrend ? true : false);
  }, [
    googleTrendsUrl,
    googleTrendsUrlQueryToken,
    relatedArticles,
    selectedTrend,
  ]);

  const handleClose = () => {
    setOpen(false);
    handleCloseDialog();
  };

  if (!relatedArticles) return null;

  const articles = relatedArticles.map((article, i) => {
    return (
      <ListItem key={i}>
        <GoogleRealtimeTrendArticleCard article={article} />
      </ListItem>
    );
  });

  return (
    <div>
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
        <Alert severity="info">
          All trend and article data are sourced from{" "}
          <Link href="https://trends.google.com/">Google Trends</Link>.
        </Alert>
        <List>
          <ListItem key={"trend-attribution"}>
            <ListItemText>
              <Box textAlign="center">
                <Link
                  href={googleTrendsUrl.replace(
                    googleTrendsUrlQueryToken,
                    selectedTrend
                  )}
                >
                  {`Click here to view "${selectedTrend}" on Google Trends`}
                </Link>
              </Box>
            </ListItemText>
          </ListItem>
          <Divider />
          {articles.length > 0 ? (
            articles
          ) : (
            <ListItem button onClick={handleClose} key={"no data"}>
              <ListItemText>
                <Box textAlign="center">No articles found!</Box>
              </ListItemText>
            </ListItem>
          )}
        </List>
      </Dialog>
    </div>
  );
}
