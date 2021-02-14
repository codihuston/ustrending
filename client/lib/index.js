// ref: https://material-ui.com/customization/components/#2-dynamic-variation-for-a-one-time-situation
export const styledBy = (property, mapping) => (props) =>
  mapping[props[property]];
