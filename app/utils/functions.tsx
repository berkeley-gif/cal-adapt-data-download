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

export function createOrStatement(parameterName: string, values: string[]): string {
    if (values.length === 0) {
        //throw new Error('Values array must not be empty');
        return ''
    }

    const orStatements = values.map(value => `${parameterName}='${value}'`);
    const fullOrStatement = orStatements.join(' or ');

    return `(${fullOrStatement})`;
}

export function searchObject(obj: any, targetValue: any): boolean {
    for (const key in obj) {
        if (obj[key] === targetValue) {
            return true;
        }

        if (typeof obj[key] === 'object' && obj[key] !== null) {
            // Recursively search nested objects
            if (searchObject(obj[key], targetValue)) {
                return true;
            }
        }
    }

    return false;
}

interface AnyObject {
    [key: string]: any;
}

export function splitStringByPeriod(inputString: string): string[] {
    return inputString.split('.');
}

export function extractFilenameFromURL(url: string): string {
    // Split the URL by '/' to get the parts
    const parts = url.split('/')

    // Get the last part of the URL which contains the filename
    const filename = parts[parts.length - 1]

    // Return the filename
    return filename
}

export function getTodaysDateAsString(): string {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0') // Month is zero-based, so we add 1
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function extractSegment(url: string, startDelimiter: string, endDelimiter: string): string | null {    
    // Find the start index of the segment
    const startIndex = url.indexOf(startDelimiter);
    
    // If start delimiter is not found, return null
    if (startIndex === -1) {
        return null;
    }

    // Adjust the start index to the beginning of the segment
    const segmentStartIndex = startIndex + startDelimiter.length;
    
    // Find the end index of the segment
    const endIndex = url.indexOf(endDelimiter, segmentStartIndex);
    
    // Extract the segment from the URL
    // If end delimiter is not found, extract until the end of the string
    const segment = endIndex === -1 
        ? url.substring(segmentStartIndex) 
        : url.substring(segmentStartIndex, endIndex);

    return segment;
}