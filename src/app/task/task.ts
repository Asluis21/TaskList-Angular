import { format, parse } from "date-fns";

export class Task {

    public id: number;
    public name: string;
    public description: string;
    public dueDate: Date | string;
    
    
    static getFormatDateTime(date: Date): string {
        return format(date, 'yyyy-MM-dd HH:mm');
    }
}
