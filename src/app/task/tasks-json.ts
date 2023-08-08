import { TaskResponse } from "./task-response";

export class TasksJson {
    private _message: string;

    private _tasks: TaskResponse;
    
    public get message(): string {
        return this._message;
    }
    public set message(value: string) {
        this._message = value;
    }
    
    public get tasks(): TaskResponse {
        return this._tasks;
    }
    public set tasks(value: TaskResponse) {
        this._tasks = value;
    }
}
