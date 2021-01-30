import React from "react";
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
} from "react-share";

function SocialBar({ url, title }) {
  return (
    <div>
      <EmailShareButton
        url={url}
        subject={title}
        body="body"
        className="Demo__some-network__share-button"
      >
        <EmailIcon size={32} />
      </EmailShareButton>
      <FacebookShareButton
        url={url}
        quote={title}
        className="Demo__some-network__share-button"
      >
        <FacebookIcon size={32} />
      </FacebookShareButton>
      <RedditShareButton
        url={url}
        title={title}
        windowWidth={660}
        windowHeight={460}
        className="Demo__some-network__share-button"
      >
        <RedditIcon size={32} />
      </RedditShareButton>
      <LinkedinShareButton
        url={url}
        className="Demo__some-network__share-button"
      >
        <LinkedinIcon size={32} />
      </LinkedinShareButton>
      <TwitterShareButton
        url={url}
        title={title}
        className="Demo__some-network__share-button"
      >
        <TwitterIcon size={32} />
      </TwitterShareButton>
    </div>
  );
}

export default SocialBar;
