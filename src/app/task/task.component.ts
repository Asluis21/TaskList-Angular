import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Task } from './task';
import { TaskService } from './task.service';
import { TaskResponse } from './task-response';
import { Observable, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Pagination } from '../utils/pagination';
import flatpickr from 'flatpickr';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  private readonly STATE_TASK = 'task';
  private readonly STATE_OVERDUE = 'overdue';
  private readonly STATE_PENDING = 'pending';
  private readonly STATE_COMPLETE = 'complete';

  public tasks: Task[] = [];
  public currentPage: number = 0;
  public pagesRanges: number[] = [];
  public selectedDate:string;
  public state : string;
  
  public selectedState: string;
  public tasksPerPage: number;


  constructor(private taskService: TaskService, private pagination: Pagination, private router : ActivatedRoute){ }
  
  @ViewChild('taskList', {static:true}) taskList!: ElementRef<HTMLUListElement>;

  ngOnInit(): void {
    this.state = this.router.snapshot.data['state'];
    this.selectedDate = Task.getFormatDateTime(new Date());
    
    this.router.paramMap.subscribe(
      (params) => {
        this.currentPage = parseInt(params.get('page')) || 0;
        this.loadPageData();

        console.log(this.tasks);
      });
      
      // Date and Time
      console.log(this.selectedDate);
  }

  ngAfterViewInit(){
    flatpickr('#datetimeFilter',{
      enableTime:true,
      dateFormat: 'Y-m-d H:i'
    })
  };



  onSubmit() : void{
    this.currentPage = 0;
    this.selectedDate = Task.getFormatDateTime(new Date(this.selectedDate));
    this.loadPageData();
  }

  private loadPageData(): void {
        
      let tasksFound : Observable<TaskResponse>;
      console.log(this.state);
      
      switch (this.state) {
        case this.STATE_OVERDUE:
          tasksFound = this.taskService.overdueTasksPageable(this.selectedDate, this.currentPage);
          break;
  
        case this.STATE_PENDING:
          tasksFound = this.taskService.pendingTasksPageable(this.selectedDate, this.currentPage);
          break;

          case this.STATE_COMPLETE:
          tasksFound = this.taskService.completeTasksPageable(this.currentPage);
          break;

        default:
          tasksFound = this.taskService.listTasksPageable(this.currentPage);
          break;
      }

      tasksFound.subscribe({
        next: (tasks) => {
          console.log(this.state);
          console.log(tasks);
          
          this.tasks = this.pagination.updatePageData(tasks)
          this.pagesRanges = this.pagination.pagesRanges;
        },

        error: (err) => {
          console.log(err);
        }
      });
  } 

  public deleteTask(id:number){
    this.taskService.deleteTaskById(id).subscribe({
      next:()=>{
        console.log("task " + id + " deleted");
        this.tasks = this.tasks.filter((task) => task.id != id);
      },

      error:(err)=>{
        console.log(err);
        
      }
    })
  }

  deleteSelectedTasks(){
    const selectedTaskIds: number[] = [];
    const checkboxes = this.taskList.nativeElement.querySelectorAll('input[type="checkbox"]');

    


    checkboxes.forEach((checkbox: HTMLInputElement)=>{
      if (checkbox.checked){
        const taskId =+ checkbox.id.replace('task', '');
        selectedTaskIds.push(taskId);
      }
    })
    
    if(selectedTaskIds.length >0){
      this.taskService.deleteTasksById(selectedTaskIds).subscribe({
        next: () => {
          this.tasks = this.tasks.filter((task) => !selectedTaskIds.includes(task.id))

        },
  
        error:(err) =>{
          console.log(err);
        }
      })

      const swalWithBootstrapButtons = Swal.mixin({
        buttonsStyling: false
      })
      
      swalWithBootstrapButtons.fire({
        title: 'Are you sure to delete?',
        text: "You won't be able to revert this!",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete them!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
  
          
          swalWithBootstrapButtons.fire(
            'Deleted!',
            'Tasks have been deleted.',
            'success'
          )
        }
      })


    } else {

      const swalWithBootstrapButtons = Swal.mixin({
        buttonsStyling: false
      })

      swalWithBootstrapButtons.fire({
        // title: 'Are you sure to delete?',
        title: "There are not tasks to delete",
        icon: 'warning',
      })


    }





  }
}
