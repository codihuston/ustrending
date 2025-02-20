import Select, { Props as SelectProps, ValueType } from "react-select";
import InputLabel from "@material-ui/core/InputLabel";
import { GoogleRegionTrend, SelectStringOptionType } from "../types";

type Props = {
  values: ValueType<SelectStringOptionType, true>;
  googleRegionTrends: GoogleRegionTrend[];
  handleChange(option: ValueType<SelectStringOptionType, true>): void;
};

export default function RegionSelect({
  values,
  googleRegionTrends,
  handleChange,
}: Props) {
  if (!googleRegionTrends || !googleRegionTrends.length) {
    return <span>Error: no google daily trends are provided!</span>;
  }

  const options: SelectStringOptionType[] = googleRegionTrends
    .sort((a, b) => {
      const x = a.name.toUpperCase();
      const y = b.name.toUpperCase();
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    })
    .map((x) => ({
      value: x.name,
      label: x.name,
    }));

  return (
    <>
      <InputLabel htmlFor="region-select">Selected Regions for Comparision</InputLabel>
      <Select
        instanceId={3}
        name="region-select"
        isMulti={true}
        value={values}
        isSearchable={true}
        onChange={handleChange}
        options={options}
      ></Select>
    </>
  );
}
