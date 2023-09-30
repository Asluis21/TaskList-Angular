import { format, parse } from "date-fns";
import { Priority } from "./priority";

export class Task {

    public id: number;
    public name: string;
    public description: string;
    public priorityId: number;
    public completed: boolean;
    public priority:Priority;
    public dueDate: Date | string;
    
    
    static getFormatDateTime(date: Date): string {
        return format(date, 'yyyy-MM-dd HH:mm');
    }
}
