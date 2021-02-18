import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";
import { Theme } from "@material-ui/core";
import { createStyles, withStyles } from "@material-ui/core/styles";

const styledBy = (property, mapping) => (props) => mapping[props[property]];
// Theme-dependent styles
const styles = ({ palette }: Theme) =>
  createStyles({
    root: {
      color: styledBy("color", {
        success: palette.success.dark,
        error: palette.error.dark,
      }),
    },
  });

  interface Props {
    foo: number;
    bar: boolean;
    number: number;
    color: string;
    classes: {
      root: string;
    };
  }

export const StyledUpArrow = withStyles(styles)(
  ({ classes, color, number, ...other }: Props) => (
    <>
      <AiOutlineArrowUp className={classes.root} {...other} /> {number}
    </>
  )
);

export const StyledDownArrow = withStyles(styles)(
  ({ classes, color, number, ...other }: Props) => (
    <>
      <AiOutlineArrowDown className={classes.root} {...other} /> {number}
    </>
  )
);
