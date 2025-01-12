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

const shuffleArray = (array: string[]): string[] => {
    const shuffled = [...array]; 
    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]]; 
    }
    return shuffled;
  };

export {trimText, shuffleArray}