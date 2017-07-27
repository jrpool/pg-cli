/// Functions testing satisfaction of commonly required argument properties.

/** POSITIVE INTEGER
  Function that returns whether the specified argument is a valid
  specification of a positive integers.
*/
const isPositiveInt = string => {
  return string !== undefined
  && /^\d+$/.test(string) && Number.isInteger(Number.parseInt(string, 10))
  && Number.parseInt(string, 10) > 0;
};

/** BOUNDED POSITIVE INTEGER RANGE
  Function that returns whether the specified argument is a valid
  specification of a range of positive integers, unbounded, inclusively
  lower-bounded, or inclusively bilaterally bounded.
*/
const isPositiveIntRange = (string, min, max) => {
  if (string === undefined) {
    return false;
  }
  const intStrings = string.split('-');
  if (intStrings.length !== 2) {
    return false;
  }
  if (isPositiveInt(intStrings[0]) && isPositiveInt(intStrings[1])) {
    const ints = intStrings.map(string => Number.parseInt(string));
    return ints[1] >= ints[0]
    && (min === undefined || ints[0] >= min)
    && (max === undefined || ints[1] <= max);
  }
  else {
    return false;
  }
};

exports.isPositiveInt = isPositiveInt;
exports.isPositiveIntRange = isPositiveIntRange;
