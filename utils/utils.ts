const trimText = (text: string, maxTitleLength: number): string => {
    if(!text){
        return ''
    }
    if (text.length <= maxTitleLength) {
        return text;
    }
    let trimmedText = text.substring(0, maxTitleLength - 2);
    const lastSpaceIndex = trimmedText.lastIndexOf(' ');

    if (lastSpaceIndex !== -1) {
        trimmedText = trimmedText.substring(0, lastSpaceIndex);
    }
    return trimmedText + '...';
};

export {trimText}