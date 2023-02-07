import * as mongoose from 'mongoose';
import config from "../../config.json" assert { type: 'json' };

export const databaseProviders = [
    {
        provide: 'DATABASE_CONNECTION',
        useFactory: async (): Promise<typeof mongoose> => {
            return mongoose.connect(config.mongodb.uri);
        },
    },
];
