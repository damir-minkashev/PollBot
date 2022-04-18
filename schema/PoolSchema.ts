import {PoolOptionsSchema} from "./PoolOptionsSchema";

export interface PoolSchema {
    id: string;
    question: string;
    answers: string[];
    options: PoolOptionsSchema;
    chat_id: string;
}
