export function mergeSort<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
  const copyArr = [...arr];
  const length = copyArr.length;

  if (length > 3) {
    const mid = Math.floor(length / 2);
    const left = mergeSort(copyArr.slice(0, mid), compare);
    const right = mergeSort(copyArr.slice(mid), compare);

    let leftIndex = 0;
    let rightIndex = 0;
    const result: T[] = [];

    while (leftIndex < left.length && rightIndex < right.length) {
      if (compare(left[leftIndex], right[rightIndex]) <= 0) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else {
        result.push(right[rightIndex]);
        rightIndex++;
      }
    }
    // 남은 요소들
    while (leftIndex < left.length) {
      result.push(left[leftIndex]);
      leftIndex++;
    }
    while (rightIndex < right.length) {
      result.push(right[rightIndex]);
      rightIndex++;
    }
    return result;
  } else {
    return copyArr.sort(compare);
  }
}
