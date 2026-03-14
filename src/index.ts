/**
 * Adds two __numbers__
 * @param firstNumber - Consists of the first operand of the addition
 * @param secondNumber - Consists of the second operand of the addition
 * @returns The addition of the two numbers `firstNumber` and `secondNumber`
 * ```typescript
 * add(1, 7) = 8
 * ```
 */
export function add(firstNumber: number, secondNumber: number): number {
  return firstNumber + secondNumber;
}

/**
 * Substracts two __numbers__
 * @param firstNumber - Consists of the first operand of the substraction
 * @param secondNumber - Consists of the second operand of the substraction
 * @returns The substraction of the two numbers `firstNumber` and `secondNumber`
 * ```typescript
 * sub(1, 7) = -6
 * ```
 *
 */
export function sub(firstNumber: number, secondNumber: number): number {
  return firstNumber - secondNumber;
}

/**
 *
 * @param firstNumber - Consists of the first operand of the division
 * @param secondNumber - Consists of the second operand of the division
 * @returns The division of the two numbers `firstNumber` and `secondNumber`
 * ```typescript
 * div(4, 8) = 0.5
 * ```
 */
export function div(firstNumber: number, secondNumber: number): number {
  if (secondNumber === 0) {
    throw new Error("Zero division");
  }
  return firstNumber / secondNumber;
}
