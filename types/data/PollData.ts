export interface PollData<T> {
    _chat: T,
    user?: number;
    command: string;
    question: string;
    answers: string[];
    options: PollOptions,
}

export interface PollOptions {
    isAnonymous: boolean,
    allowsMultipleAnswers: boolean,
    pinPool: boolean,
    addTimeToTitle: boolean,
}
