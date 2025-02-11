/**
 * Checks if a given string is a palindrome, ignoring spaces, punctuation, and capitalization.
 * Uses the two-pointer technique for optimization.
 *
 * @param {string} str The string to check.
 * @returns {boolean} True if the string is a palindrome, false otherwise.
 */
const isPalindrome = (str) => {
  // Preprocessing: Remove spaces, punctuation, and convert to lowercase.
  const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  console.log("Cleaned string:", cleanStr); // Added log for debugging

  // Two-pointer technique:
  let left = 0;
  let right = cleanStr.length - 1;

  while (left < right) {
    console.log(`Comparing ${cleanStr[left]} and ${cleanStr[right]}`); // Added log for debugging
    if (cleanStr[left] !== cleanStr[right]) {
      return false; // If characters don't match, it's not a palindrome.
    }
    left++;
    right--;
  }

  return true; // If the loop completes without finding mismatches, it's a palindrome.
};

// Test cases for isPalindrome
console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("race a car")); // true
console.log(isPalindrome("hello")); // false
console.log(isPalindrome("")); // true
console.log(isPalindrome("12321")); // true
console.log(isPalindrome("12345")); // false
