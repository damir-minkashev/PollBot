import { Document } from 'mongoose';

export interface ChatDocument extends Document{
    chatId: number;
    title: string
    userId: string;
}
