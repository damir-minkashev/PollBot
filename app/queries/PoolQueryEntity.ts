import {QueryEntity} from "./QueryEntity";
import {QueryTypeEnum} from "./QueryTypeEnum";

export default interface PoolQueryEntity
    extends QueryEntity {

    type: QueryTypeEnum.CHOOSE_POOL,

    poolId: string;
}
