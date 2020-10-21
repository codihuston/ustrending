import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import { AllHtmlEntities } from "html-entities";

import SocialBar from "./SocialBar";

const useStyles = makeStyles((theme) => ({
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
  cover: {
    minWidth: "85px",
    maxHeight: "85px",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    paddingBottom: theme.spacing(1),
  },
  playIcon: {
    height: 38,
    width: 38,
  },
}));

export default function MediaControlCard({ article, number }) {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <div className={classes.details}>
        <CardContent className={classes.content}>
          <Typography component="h6" variant="h6">
            <Link
              href={article.url}
              className="text-decoration-none d-inline-block"
            >
              {AllHtmlEntities.decode(article.title)}
            </Link>
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {article.timeAgo} – {article.source}
          </Typography>
        </CardContent>
        <CardContent className={classes.content}>
          <Typography className={classes.controls}>
            {AllHtmlEntities.decode(article.snippet)}
          </Typography>
          <SocialBar
            url={article.url}
            title={AllHtmlEntities.decode(article.title)}
          />
        </CardContent>
      </div>
      <CardMedia
        className={classes.cover}
        // some articles haven't an image
        image={article.image?.imageUrl ? article.image?.imageUrl : "Not found"}
        title={AllHtmlEntities.decode(article.title)}
      />
    </Card>
  );
}
