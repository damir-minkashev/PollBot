import {QueryEntity} from "./QueryEntity";
import {QueryTypeEnum} from "./QueryTypeEnum";

export default interface ChatQueryEntity
    extends QueryEntity {

    type: QueryTypeEnum.CHOOSE_CHAT,

    chatId: number;
}
