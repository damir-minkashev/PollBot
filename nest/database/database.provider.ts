import * as mongoose from 'mongoose';

export const databaseProviders = [
    {
        provide: 'DATABASE_CONNECTION',
        useFactory: async (): Promise<typeof mongoose> => {
            console.log(process.env.MONGO_URI);
            return mongoose.connect(process.env.MONGO_URI as string);
        },
    },
];
