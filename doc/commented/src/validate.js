/// Functions testing satisfaction of commonly required argument properties.

/** POSITIVE INTEGER
  Function that returns whether the specified argument is a valid
  specification of a positive integers.
*/
const isPositiveInt = string => {
  // Integer.
  return string !== undefined
  // Integer.
  && /^\d+$/.test(string) && Number.isInteger(Number.parseInt(string, 10))
  // Positive.
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
  // Split the argument on its first “-”.
  const intStrings = string.split('-', 2);
  // 2 segments.
  return intStrings.length === 2
    // Both positive integers.
    && isPositiveInt(intStrings[0])
    && isPositiveInt(intStrings[1])
    // Nondescending order.
    && intStrings[1] >= intStrings[0]
    // Within bounds, if specified.
    && (min === undefined || intStrings[0] >= min)
    && (max === undefined || intStrings[1] <= max);
};

exports.isPositiveInt = isPositiveInt;
exports.isPositiveIntRange = isPositiveIntRange;
