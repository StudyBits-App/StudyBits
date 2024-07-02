export interface Course {
    key: string;
    picUrl: string;
    name: string;
    description: string;
}

export const defaultCourse: Course = {
    key: ';',
    picUrl: '',
    name: '',
    description: '',
};

export interface CourseCardProps {
    id: string;
    editing: boolean;
}  

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
  
export interface Unit {
    key: string;
    name: string;
    description: string;
}

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

export interface QuestionAnswer {
    key: string;
    content: string;
    answer: boolean;
    isSelected: boolean;
}

export interface QuestionInfo {
    question: string;
    hints: Hint[];
    answers: QuestionAnswer[];
}