import * as mongoose from "mongoose";

export default async function (uri: string) {
    try {
        await mongoose.connect(uri);
        console.log('Mongodb connection success');
    } catch (e) {
        console.error(e);
    }
}

