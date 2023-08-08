import { Injectable } from '@angular/core';
import { Task } from "../task/task";
import { TaskResponse } from "../task/task-response";
import { Observable, tap } from 'rxjs';
import { TaskService } from "../task/task.service";

@Injectable({
    providedIn: 'root'
})
export class Pagination {

    private firstPage: number = 0;
    private lastPage: number;
    public currentPage: number = 0;
    public pagesRanges: number[] = [];
    private _tasksPerPage: number;

    constructor(){ }
    
    public get tasksPerPage(): number {
        return this._tasksPerPage;
    }
    public set tasksPerPage(value: number) {
        this._tasksPerPage = value;
    }

    public getPaginator(currentPage: number, totalPages: number): void {

        const halfTasksPerPage: number = Math.ceil(this.tasksPerPage / 2);
    
        if (totalPages <= this.tasksPerPage) {
          this.firstPage = 0;
          this.lastPage = totalPages - 1;
          
        } else if (currentPage <= halfTasksPerPage) {
          this.firstPage = 0;
          this.lastPage = this.tasksPerPage;
    
        } else if (currentPage >= totalPages - (halfTasksPerPage)) {
          this.firstPage = totalPages - this.tasksPerPage;
          this.lastPage = totalPages - 1;
    
        } else {
    
          this.firstPage = currentPage - (halfTasksPerPage);
          this.lastPage = currentPage + (halfTasksPerPage);
        }
    }

    public updatePageData(task: TaskResponse): Task[] {
        this.updatePaginationData(task);
        this.updatePageRanges();
        
        return task.content;
    }
    
    private updatePaginationData(task: TaskResponse): void {
        this.currentPage = task.number;
        this.tasksPerPage = task.size;    
        this.getPaginator(task.number, task.totalPages);
    }

    private updatePageRanges():void {
        this.pagesRanges = [];

        for(let i = this.firstPage; i <= this.lastPage; i++){
            this.pagesRanges.push(i);
        }
    }

}