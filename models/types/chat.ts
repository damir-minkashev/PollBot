import { Document } from 'mongoose';
import {ChatData} from "../../types/data/ChatData";

export interface ChatDocument extends ChatData, Document {}
