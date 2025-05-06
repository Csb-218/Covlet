export function convert_to_readable(text:string){
    return text
    .replace(/\n/g, '<br>')
}

export function convert_to_downloadable_pdf(text:string){
    return text
    .replace(/<br\s*\/?>/gi, '\n') // Replace <br> tags with newlines
    .replace(/<[^>]*>?/g, ''); // Remove any other HTML tags
}

export function convert_to_readable_input(text:string){
    return text
    .replace(/<br\s*\/?>/gi, '\n') // Replace <br> tags with newlines
    .replace(/<[^>]*>?/g, ''); // Remove any other HTML tags
}

/**
 * Converts the input text into a format suitable for an input box.
 * This function removes HTML tags and replaces line breaks with newlines.
 *
 * @param text - The input text to be converted.
 * @returns The converted text with HTML tags removed and line breaks replaced with newlines.
 */
export function toInputBox(text: string): string {
    return text
        .replace(/<([a-zA-Z]+)([^>]*)\/?>/g, '\n')
        .replace(/<\/([a-zA-Z]+)>/g, ' ');
}