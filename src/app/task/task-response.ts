import { Task } from "./task";

export class TaskResponse {
    
    private _content: Task[];
    private _totalElements: number;
    private _totalPages: number; 
    private _number: number; // current page
    private _size: number; // tasks per page
    
    
    public get content(): Task[] {
        return this._content;
    }
    public set content(value: Task[]) {
        this._content = value;
    }


    public get totalElements(): number {
        return this._totalElements;
    }
    public set totalElements(value: number) {
        this._totalElements = value;
    }

    
    public get totalPages(): number {
        return this._totalPages;
    }
    public set totalPages(value: number) {
        this._totalPages = value;
    }
    
    
    public get number(): number {
        return this._number;
    }
    public set number(value: number) {
        this._number = value;
    }
    
    public get size(): number {
        return this._size;
    }
    public set size(value: number) {
        this._size = value;
    }
}

