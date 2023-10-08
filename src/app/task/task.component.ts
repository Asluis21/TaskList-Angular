import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit} from '@angular/core';
import { Task } from './task';
import { TaskService } from './task.service';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Pagination } from '../utils/pagination';
import flatpickr from 'flatpickr';
import Swal from 'sweetalert2';
import { DataSharingService } from './data-sharing.service';
import { TasksJson } from './tasks-json';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly STATE_OVERDUE = 'overdue';
  private readonly STATE_PENDING = 'pending';
  private readonly STATE_COMPLETE = 'complete';
  private readonly STATE_TASK = 'task';

  public tasks: Task[] = [];
  public currentPage: number = 0;
  public pagesRanges: number[] = [];
  public selectedDate:string;
  public state : string;
  private subscriptions: Subscription[] = [];

  public selectedState: string;
  inputValue: string = null;
  errorMessage: string = '';
  tittle = '';
  private flatpickrInstance: flatpickr.Instance;

  constructor(private taskService: TaskService, private pagination: Pagination, private activatedRoute : ActivatedRoute, private router : Router, private dataSharingService:DataSharingService){ }
  
  @ViewChild('taskList', {static:true}) taskList!: ElementRef<HTMLUListElement>;

  ngOnInit(): void {
    
    this.selectedDate = Task.getFormatDateTime(new Date());
    
    this.subscriptions.push(
      this.activatedRoute.paramMap.subscribe((params) => {

        this.currentPage = parseInt(params.get('page'));
        this.state = params.get('state');

        if(this.inputValue != null){
          this.fillTasks();
        }
      })  
    );

    this.subscriptions.push(
      this.dataSharingService.inputValue$.subscribe((value) => {
            this.currentPage = 0
            this.inputValue = value;
            this.fillTasks();
      })
    );
  }

  ngOnDestroy(): void {
    this.destroyFlatpickr();
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private initFlatpickr(): void {
    const datetimeFilter = document.getElementById('datetimeFilter') as HTMLInputElement;
    
    if (datetimeFilter) {
      this.flatpickrInstance = flatpickr(datetimeFilter, {
        enableTime: true,
        dateFormat: 'Y-m-d H:i'
      });
    }
  }

  private destroyFlatpickr(): void {
    if (this.flatpickrInstance) {
      this.flatpickrInstance.destroy();
    }
  }

  ngAfterViewInit(){
    this.initFlatpickr();
  }

  filterByDate() : void{
    this.currentPage = 0;
    this.selectedDate = Task.getFormatDateTime(new Date(this.selectedDate));
    this.fillTasks();
  }

  private getDataFromState(): Observable<TasksJson> {

      switch (this.state) {
        case this.STATE_OVERDUE:
            return this.taskService.overdueTasksPageable(this.selectedDate, this.currentPage, this.inputValue);
        case this.STATE_PENDING:
            return this.taskService.pendingTasksPageable(this.selectedDate, this.currentPage, this.inputValue);
          case this.STATE_COMPLETE:
            return this.taskService.completeTasksPageable(this.currentPage, this.inputValue);
          case this.STATE_TASK:
            return this.taskService.listTasksPageable(this.currentPage, this.inputValue);
        default:
          this.router.navigate(["**"]);
          return undefined;
      }
  }

  private fillTasks(){

    if(this.getDataFromState() != undefined){

      this.getDataFromState().subscribe({
        next: (tasks) => {
          console.log(tasks);
          this.tittle = tasks.title;
          this.tasks = this.pagination.updatePageData(tasks.tasks);
          this.pagesRanges = this.pagination.pagesRanges;
          this.errorMessage = '';
        },
  
        error: (err) => {
          this.tasks = [];
          this.tittle = err.title;
          this.errorMessage = err.message
        }
      }); 
    }
  }

  getPriorityColor(idPriority : number):string{
    
    switch(idPriority){
      case 1:
        return 'var(--red)'
      
      case 2:
        return 'var(--yellow)'

      case 3:
        return 'var(--green-light)'
      
      default:
        return 'var(--muted)'
    }
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
          
          this.taskService.deleteTasksById(selectedTaskIds).subscribe({
            next: () => this.tasks = this.tasks.filter((task) => !selectedTaskIds.includes(task.id)),
            error:(err) =>console.log(err)
          })
          
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
        title: "There are not tasks to delete",
        icon: 'warning',
      })
    }
  }
}
