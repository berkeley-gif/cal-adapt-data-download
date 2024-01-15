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

export function handleDownload(url: string): void {
    // Replace 'your-file-url' with the actual URL of the file you want to download
    const fileUrl = url;

    // Create an invisible anchor element
    const link = document.createElement('a');
    link.href = fileUrl;

    // Set the download attribute to specify the filename
    link.download = 'downloaded-file.txt';

    // Append the anchor to the body and trigger a click event
    document.body.appendChild(link);
    link.click();

    // Remove the anchor from the body
    document.body.removeChild(link);
}