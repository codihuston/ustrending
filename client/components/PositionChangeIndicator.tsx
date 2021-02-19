import { BsDash } from "react-icons/bs";

import { StyledUpArrow, StyledDownArrow } from "./Icons";

export default function PositionChangeIndicator({ index }) {
  const description = `This trend has changed ${
    index > 0 ? `+${index}` : index
  } positions relative to the trends for this country.`;
  let Position = null;

  if (index > 0) {
    Position = <StyledUpArrow color={"success"} number={index} />;
  } else if (index < 0) {
    Position = <StyledDownArrow color={"error"} number={index * -1} />;
  } else if (index === 0) {
    return <BsDash />;
  }
  return (
    <span title={description} className="cursor-pointer">
      {Position}
    </span>
  );
}
