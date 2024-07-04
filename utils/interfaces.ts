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

export interface CourseCardShortProps {
    action: boolean;
    id: string
    selected?: boolean;
    onPress?: () => void;
  }

export interface Unit {
    key: string;
    name: string;
    description: string;
}

export interface UnitCardProps {
    id: string;
    courseId: string;
    selected: boolean;
    onPress?: () => void;
}

export const defaultUnit: Unit = {
    key: ';',
    name: '',
    description: '',
};

export interface CoursesAndUnitsPageProps {
    isVisible: boolean;
    onClose: () => void;
    onSelect: (courseKey: string | null, unitKey: string | null) => void;
    initialCourseKey?: string | null;
    initialUnitKey?: string | null;
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