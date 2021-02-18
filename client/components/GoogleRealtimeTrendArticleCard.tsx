import React from "react";
import { decode } from "html-entities";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Link,
  Theme,
  Typography
} from "@material-ui/core";

import { GoogleRealtimeTrendArticle } from "../types";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: "1 0 auto",
  },
  articleImage: {
    minWidth: "100px",
    maxHeight: "100px",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    paddingBottom: theme.spacing(1),
  },
}));

type Props = {
  article: GoogleRealtimeTrendArticle;
};

export function GoogleRealtimeTrendArticleCard({ article }: Props) {
  const classes = useStyles();

  return (
    <Box width={"100%"}>
      <Card className={classes.root}>
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography component="h6" variant="h6">
              <Link
                href={article.url}
                className="text-decoration-none d-inline-block"
              >
                {decode(article.articleTitle)}
              </Link>
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {article.time} – {article.source}
            </Typography>
            <Typography>{decode(article.snippet)}</Typography>
          </CardContent>
        </div>
      </Card>
    </Box>
  );
}
