/**
 * Implements the bubble sort algorithm to sort an array of numbers in ascending order.
 * Includes an optimization to stop early if the array is already sorted and error handling
 * for invalid input.
 *
 * @param {number[]} arr The array of numbers to sort.
 * @returns {number[]} The sorted array, or an empty array if the input is invalid.
 */
const bubbleSort = (arr) => {
  // Error handling: Check if the input is a valid array of numbers.
  if (!Array.isArray(arr) || arr.some(isNaN)) {
    return []; // Return an empty array if input is invalid.
  }

  const len = arr.length;
  let swapped;

  // Optimization: Stop early if the array is already sorted.
  do {
    swapped = false;
    for (let i = 0; i < len - 1; i++) {
      // Compare adjacent elements and swap if they are in the wrong order.
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; // ES6 destructuring assignment for swapping
        swapped = true;
      }
    }
  } while (swapped); // Continue iterating only if a swap occurred in the previous pass.

  return arr;
};

// Test cases
console.log(bubbleSort([5, 1, 4, 2, 8])); // Expected output: [1, 2, 4, 5, 8]
console.log(bubbleSort([1, 2, 3, 4, 5])); // Expected output: [1, 2, 3, 4, 5]
console.log(bubbleSort([5, 4, 3, 2, 1])); // Expected output: [1, 2, 3, 4, 5]
console.log(bubbleSort([])); // Expected output: []
console.log(bubbleSort([1, 2, "a", 4, 5])); // Expected output: []
console.log(bubbleSort(5)); // Expected output: []
