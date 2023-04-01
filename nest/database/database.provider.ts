import * as mongoose from 'mongoose';

export const databaseProviders = [
    {
        provide: 'DATABASE_CONNECTION',
        useFactory: async (): Promise<typeof mongoose> => {
            console.log('uri', process.env.MONGO_URI);
            return mongoose.connect(process.env.MONGO_URI as string, {
                user: process.env.MONGO_USER,
                pass: process.env.MONGO_PASS,
                dbName: 'pollbot',
                authSource: 'pollbot',
            });
        },
    },
];
