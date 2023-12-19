export function stringToArray(inputString: string): string[] {
    // Split the input string by commas
    const arrayResult: string[] = inputString.split(',');

    // Trim any leading or trailing whitespaces from each element
    const trimmedArray: string[] = arrayResult.map((item) => item.trim());

    return trimmedArray;
}

export function arrayToCommaSeparatedString(arr: string[]): string {
    return arr.join(', ');
}

export function getPropertyValueById(items: any[], itemId: number, propertyName: keyof any): any | undefined {
    const foundItem = items.find(item => item.id === itemId);

    if (foundItem) {
        return foundItem[propertyName];
    }

    return undefined;
}