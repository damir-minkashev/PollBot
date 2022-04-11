import {QueryEntity} from "./QueryEntity";
import {QueryTypeEnum} from "./QueryTypeEnum";

export default interface SaveQueryEntity
    extends QueryEntity {

    type: QueryTypeEnum.SAVE_POOL;

    flag: boolean;

}
