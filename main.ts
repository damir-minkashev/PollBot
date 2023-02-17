import {NestFactory} from "@nestjs/core";
import {BotModule} from "./nest/bot.module";
import * as dotenv from 'dotenv';

async function start() {
    dotenv.config();
    await NestFactory.createApplicationContext(BotModule);

    process.on('unhandledRejection', (reason, promise) => {
        // tslint:disable-next-line: no-console
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
}

start();
