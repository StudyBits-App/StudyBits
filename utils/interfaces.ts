export interface Channel {
  courses: string[];
  bannerURL: string;
  profilePicURL: string;
  displayName: string;
}

export const defaultChannel: Channel = {
  courses: [],
  bannerURL: "",
  profilePicURL: "",
  displayName: "",
};

export interface Course {
  key: string;
  creator: string;
  picUrl: string;
  name: string;
  description: string;
  lastModified: number;
}
export const defaultCourse: Course = {
  key: "",
  creator: "",
  picUrl: "",
  name: "",
  description: "",
  lastModified: new Date().getTime(),
};

export interface Unit {
  key: string;
  name: string;
  description: string;
  order: number;
}

export const defaultUnit: Unit = {
  key: ";",
  name: "",
  description: "",
  order: 1,
};

export interface Hint {
  key: string;
  title: string;
  content: string;
  image: string;
}

export interface Answer {
  key: string;
  content: string;
  answer: boolean;
}

export interface QuestionInfo {
  question: string;
  hints: Hint[];
  answers: QuestionAnswer[];
  course: string;
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

export interface Participant {
  name: string;
  points: number;
}

export interface ChannelDisplayProps {
  id: string;
  displayBanner: boolean;
  link?: string;
  params?: { [key: string]: string | number };
}

export interface QuestionMetadata {
  courseName: string;
  unitName: string;
  questionId: string;
  courseId: string;
}