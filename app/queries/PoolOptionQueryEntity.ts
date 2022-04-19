import {QueryEntity} from "./QueryEntity";
import {QueryTypeEnum} from "./QueryTypeEnum";
import {PoolOptionsSchema} from "../../schema/PoolOptionsSchema";

interface PoolOptionQueryEntity
    extends QueryEntity {

    type: QueryTypeEnum.CHOOSE_OPTION;

    default?: boolean;

}

export interface PoolOptionQueryDefault
    extends PoolOptionQueryEntity {

    default: true;

}

export interface PoolOptionQueryCustom
    extends PoolOptionQueryEntity {

    key: keyof PoolOptionsSchema;

    value: PoolOptionsSchema[keyof PoolOptionsSchema];

}

export type PoolOptionQueryTypes = PoolOptionQueryDefault | PoolOptionQueryCustom;
