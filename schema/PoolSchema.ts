import {PoolOptionsSchema} from "./PoolOptionsSchema";

/**
 * @deprecated
 */
export interface PoolSchema {
    id: string;
    question: string;
    answers: string[];
    options: PoolOptionsSchema;
    chat_id: string;
}
