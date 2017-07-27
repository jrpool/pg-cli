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
  return intStrings.length === 2
    && isPositiveInt(intStrings[0])
    && isPositiveInt(intStrings[1])
    && intStrings[1] >= intStrings[0]
    && (min === undefined || intStrings[0] >= min)
    && (max === undefined || intStrings[1] <= max);
};

exports.isPositiveInt = isPositiveInt;
exports.isPositiveIntRange = isPositiveIntRange;
