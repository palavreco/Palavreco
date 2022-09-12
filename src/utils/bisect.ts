export function bisect<T>(array: T[], item: T): number {
	let low = 0;
	let mid;
	let high = array.length;
	while (low < high) {
		mid = (low + high) >>> 1; // faster version of Math.floor((low + high) / 2)
		if (array[mid] < item) {
			low = mid + 1;
		} else {
			high = mid;
		}
	}

	return low;
}
