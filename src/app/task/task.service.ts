import { Injectable } from '@angular/core';
import { HttpClient,  HttpHeaders,  HttpParams } from '@angular/common/http';
import { of, Observable, EMPTY, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Task } from './task';
import { NavigationExtras, Router } from '@angular/router';
import { TaskResponse } from './task-response';
import { TasksJson } from './tasks-json';
import { catchError } from 'rxjs/operators';
import { Priority } from './priority';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private url = 'http://localhost:8080';

  constructor(private http: HttpClient, private router : Router) { }

  listTasks(): Observable<Task[]>{
    return this.http.get<{tasks : Task[]}>(this.url+ "/tasks").pipe(
      map(task => task.tasks)
    );
  }

  listTasksPageable(page:number, keyword:string):Observable<TaskResponse>{
    let params = new HttpParams().set('page', page.toString());
    
    if(keyword != null) {
      params = params.set('keyword', keyword);
    }

    return this.http.get<TasksJson>(this.url + '/tasksPageable', {params}).pipe(
      map(res => res.tasks)
    );
  }

  overdueTasksPageable(date:string, page:number):Observable<TaskResponse>{
    let params = new HttpParams().set('page', page);
    params = params.set('date', date);
    

    return this.http.get<TasksJson>(this.url+'/overdueTasksPageable', {params}).pipe(
      map((res) => res.tasks)
    );
  }

  pendingTasksPageable(date:string, page:number):Observable<TaskResponse>{
    let params = new HttpParams().set('page', page);
    params = params.set('date', date);

    return this.http.get(this.url + '/pendingTasksPageable', {params}).pipe(
      map((res:any) => res.tasks),
      catchError((error) => {
        return throwError(() => error.error.message);
      })
    );
  }

  completeTasksPageable(page:number): Observable<TaskResponse>{
    let params = new HttpParams().set('page', page);
    
    return this.http.get<TasksJson>(this.url + '/completeTasksPageable', {params}).pipe(
      map((res) => res.tasks)
    );
  }

  findTaskById(id:number):Observable<Task>{
    return this.http.get<{tasks : Task }>(this.url+'/tasks/'+ id).pipe(
      map((res) => res.tasks),
      catchError((error) => {
        this.router.navigate(['/task'])
        console.log(error.error.message);
        return EMPTY;
      })
    );
  }

  private httpHeader = new HttpHeaders({'Content-Type':'application/json'});

  createTask(task:Task):Observable<Task>{
    return this.http.post(this.url+'/tasks', task, {headers:this.httpHeader}).pipe(
      map((res:any) =>{
        return res.task as Task
      }),
      catchError((err) => {
        console.log(err.error.message);

        return throwError(() => err.error.message);
      })
    );
  }

  editTask(id:number, task:Task):Observable<Task>{
    return this.http.put(this.url+'/tasks/' + id, task, {headers:this.httpHeader}).pipe(
      map((res:any) =>{
        return res.task as Task
      }),
      catchError((err) => {
        console.log(err.error.message);
        return throwError(() => err.error.message);
      })
    );
  }

  deleteTaskById(id:number):Observable<Task>{
    return this.http.delete(this.url+'/deleteTask/' + id).pipe(
      map((res:any) =>{
        console.log(res.message);
        return res.tasks as Task
      }),
      catchError((err) => throwError(() => err.message))
    );
  }

  deleteTasksById(ids:number[]):Observable<string>{
    let params = new HttpParams().set('ids', ids.join(","));

    return this.http.delete(this.url+'/deleteTasks', {params}).pipe(
        map((res:any) => res.message),
        catchError((err) => throwError(() => err.message))
    );
  }

  // PRIORITY
  findAllPriorities():Observable<Priority[]>{
    return this.http.get(this.url+'/priority').pipe(
      map((res:any) => res.priorities),
      catchError((err) => throwError(() => err.message))
    )
  }
} 
