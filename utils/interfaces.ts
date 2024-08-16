export interface Channel {
    courses: string[];
    bannerURL: string;
    profilePicURL: string;
    displayName: string;
}

export const defaultChannel: Channel = {
    courses: [],
    bannerURL: '',
    profilePicURL: '',
    displayName: '',
};
  
export interface Course {
    key: string;
    creator: string;
    picUrl: string;
    name: string;
    description: string;
}
export const defaultCourse: Course = {
    key: ';',
    creator: '',
    picUrl: '',
    name: '',
    description: '',
};

export interface Unit {
    key: string;
    name: string;
    description: string;
    order: number;
}

export const defaultUnit: Unit = {
    key: ';',
    name: '',
    description: '',
    order: 1
};
  
export interface Hint {
    key: string;
    title: string;
    content: string;
    image: string;
}

export interface Answer {
    key: string;
    content: string,
    answer: boolean,
}

export interface QuestionInfo {
    question: string;
    hints: Hint[];
    answers: QuestionAnswer[];
}

export interface QuestionAnswer {
    key: string;
    content: string;
    answer: boolean;
    isSelected: boolean;
}

export interface Question {
    id: string;
    question: string;
    hints: Hint[];
    answers: Answer[];
    course: string;
    unit: string;
  }