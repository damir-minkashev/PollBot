import {Module} from "@nestjs/common";
import {PoolUpdate} from "./pool.update";

@Module({
    providers: [PoolUpdate]
})
export class PoolModule {}
