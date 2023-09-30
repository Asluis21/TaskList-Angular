import { Task } from "./task";

export class TaskResponse {
    
    public content: Task[];
    public totalElements: number;
    public totalPages: number; 
    public number: number; // current page
    public size: number; // tasks per page

}

