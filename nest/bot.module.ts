import {Module} from "@nestjs/common";
import {TelegrafModule} from "nestjs-telegraf";
import {PoolModule} from "./pool/pool.module";

@Module({
    imports: [
        TelegrafModule.forRoot({
            token: '5374201626:AAEzDLQE3elDKyNUz4oP0cEdagORxdu_8kA',
            include: [PoolModule],
        }),
        PoolModule,
    ],
})
export class BotModule {}
