import {NewPoolStateEnum} from "./NewPoolStateEnum";
import PoolController from "../../controllers/PoolController";
import {Context} from "telegraf";
import {Update} from "typegram";
import {PoolOptionsSchema} from "../../schema/PoolOptionsSchema";

export default class NewPoolTask {

    private poolState: NewPoolStateEnum

    private chatId: number | undefined;

    private name: string | undefined;

    private question: string | undefined;

    private answers: string[] = [];

    private options: PoolOptionsSchema;

    constructor(private controller: PoolController) {
        this.poolState = NewPoolStateEnum.CHOOSE_CHAT;
        this.options = {
            pinPool: false,
            allowsMultipleAnswers: false,
            isAnonymous: false,
            addTimeToTitle: false,
        }
    }

    public isChooseChatState() {
        return this.chatId === undefined && this.poolState === NewPoolStateEnum.CHOOSE_CHAT;
    }

    public isSetNameState() {
        return this.name === undefined && this.poolState === NewPoolStateEnum.SET_NAME;
    }

    public isSetQuestionState() {
        return this.question === undefined && this.poolState === NewPoolStateEnum.SET_QUESTION;
    }

    public isSetAnswerState() {
        return this.poolState === NewPoolStateEnum.SET_ANSWER;
    }

    /**
     *
     */
    public isSetOptions() {
        return this.poolState === NewPoolStateEnum.SET_OPTIONS;
    }

    public setChatId(chatId: number) {
        this.poolState = NewPoolStateEnum.SET_NAME;
        this.chatId = chatId;
    }

    public setName(poolName: string) {
        this.poolState = NewPoolStateEnum.SET_QUESTION;
        this.name = poolName;
    }

    public setQuestion(question: string) {
        this.poolState = NewPoolStateEnum.SET_ANSWER;
        this.question = question;
    }

    public addAnswer(answer: string) {
        this.answers.push(answer);
    }

    public setOption<K extends keyof PoolOptionsSchema>(key: K, value: PoolOptionsSchema[K]) {
        this.options[key] = value;
    }

    public setDefaultOption() {
        this.options.pinPool = true;
        this.options.allowsMultipleAnswers = true;
        this.options.addTimeToTitle = true;
    }

    public countAnswer() {
        return this.answers.length;
    }

    public setDone() {
        this.poolState = NewPoolStateEnum.DONE;
    }

    public getPoolData(): PoolData {
        this.assertIsNotUndefined(this.question);
        this.assertAnswers(this.answers);

        return {
            question: this.question,
            answers: this.answers,
            options: this.options
        }
    }

    public store() {
        this.assertIsNotUndefined(this.chatId);
        this.assertIsNotUndefined(this.name);
        this.assertIsNotUndefined(this.question);
        this.assertAnswers(this.answers);

        return this.controller.createPool(this.chatId, this.name, this.question, this.answers, this.options);
    }

    private assertIsNotUndefined(data: string | number | undefined): asserts data is string | number {
        if(data === undefined)
            throw new Error("Invalid input");
    }

    private assertAnswers(answers: string[]) {
        if(answers.length === 0)
            throw new Error("Answers is empty");
    }
}

export interface PoolData {
    question: string,
    answers: string[],
    options: PoolOptionsSchema,
}
