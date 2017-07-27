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
  // Require the argument be defined.
  if (string === undefined) {
    return false;
  }
  // Split it on “-”.
  const intStrings = string.split('-');
  // Require there be segments.
  if (intStrings.length !== 2) {
    return false;
  }
  // If both specify positive integers:
  if (isPositiveInt(intStrings[0]) && isPositiveInt(intStrings[1])) {
    // Identify them.
    const ints = intStrings.map(string => Number.parseInt(string));
    // Require they be in nondescending order
    return ints[1] >= ints[0]
    // and, if specified, within bounds.
    && (min === undefined || ints[0] >= min)
    && (max === undefined || ints[1] <= max);
  }
  // Otherwise, i.e. if both do not specify positive integers, report failure.
  else {
    return false;
  }
};

exports.isPositiveInt = isPositiveInt;
exports.isPositiveIntRange = isPositiveIntRange;
