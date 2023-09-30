import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit} from '@angular/core';
import { Task } from './task';
import { TaskService } from './task.service';
import { TaskResponse } from './task-response';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Pagination } from '../utils/pagination';
import flatpickr from 'flatpickr';
import Swal from 'sweetalert2';
import { DataSharingService } from './data-sharing.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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

  public tasks: Task[] = [];
  public currentPage: number = 0;
  public pagesRanges: number[] = [];
  public selectedDate:string;
  public state : string;
  private subscriptions: Subscription[] = [];

  public selectedState: string;
  public tasksPerPage: number;
  inputValue: string = null;
  errorMessage: string = '';
  tittle = '';
  firstLoad = true;
  private flatpickrInstance: flatpickr.Instance;

  constructor(private taskService: TaskService, private pagination: Pagination, private route : ActivatedRoute, private dataSharingService:DataSharingService){ }
  
  @ViewChild('taskList', {static:true}) taskList!: ElementRef<HTMLUListElement>;

  ngOnInit(): void {
    console.log("ngOnInit()");
    
    this.selectedDate = Task.getFormatDateTime(new Date());
    
    this.subscriptions.push(
      this.dataSharingService.inputValue$
        .subscribe((value) => {

          this.initFlatpickr();
          console.log("inputValue: " + this.inputValue + ", value desde el service:" + value);
          console.log('this.inputValue: ' + this.inputValue);
          console.log('Value: ' + value);

          
          this.state = this.route.snapshot.data['state'];
          
          console.log("this.inputValue != value: " + (this.inputValue != value));
        
          if(this.inputValue != value && this.inputValue != null){
            this.currentPage = 0
          }else{
            this.route.paramMap.subscribe((params) => {
              this.currentPage = parseInt(params.get('page'));
              console.log(this.currentPage);
              console.log(this.inputValue);
  
              if(this.inputValue != null){
                this.loadPageData();
              }
            })
          }
          
          this.inputValue = value;
          this.loadPageData();
      })


      //     this.route.paramMap.subscribe((params) => {
            
      //         this.initFlatpickr();
      //         console.log("TIPO DE CARGAR: loadPageData por parametro page");
              
              
      //         this.currentPage = parseInt(params.get('page')) || 0

              

      //         this.state = this.route.snapshot.data['state'];
      //         console.log("this.state: " + this.state);
      //         console.log('this.inputValue: ' + this.inputValue);

      //         this.loadPageData();
      // })
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
    console.log("ngAfterViewInit()");

    // this.subscriptions.push(
    //   this.dataSharingService.inputValue$
    //     // .pipe(debounceTime(300), distinctUntilChanged())
    //     .subscribe((value) => {
    //       if(!this.firstLoad){
    //         console.log(this.firstLoad);
            
    //         this.initFlatpickr();
    //         console.log("TIPO DE CARGAR: loadPageData por busqueda en la barra 2");
    //         this.inputValue = value;
    //         console.log('this.inputValue: ' + this.inputValue);
  
    //         this.state = this.route.snapshot.data['state'];
    //         this.currentPage = 0
            
    //         this.loadPageData();
    //       }
    //   })
    // );

    // this.firstLoad = false;
  }

  public isEmptyOrSpaces(str : string) : boolean{
    return str === null || str.match(/^ *$/) !== null;
}

  filterByDate() : void{
    this.currentPage = 0;
    this.selectedDate = Task.getFormatDateTime(new Date(this.selectedDate));
    this.loadPageData();
  }

  // public searchByBar(){
  //   this.subscriptions.push(
  //     this.dataSharingService.inputValue$
  //       // .pipe(debounceTime(300), distinctUntilChanged())
  //       .subscribe((value) => {

  //         this.initFlatpickr();
  //         console.log("TIPO DE CARGAR: loadPageData por busqueda en la barra");
  //         this.inputValue = value;
  //         console.log('this.inputValue: ' + this.inputValue);

          
  //         this.state = this.route.snapshot.data['state'];
  //         this.currentPage = 0
  //         // this.tittle = 'Tasks ' + this.state.charAt(0).toUpperCase() + this.state.slice(1);
          
  //         this.loadPageData();
  //     })
  //   );
  // }
  

  private loadPageData(): void {
        
      let tasksFound : Observable<TasksJson>;
      console.log('STATE: ' + this.state);
      console.log('this.selectedDate: ' + this.selectedDate);
      
      switch (this.state) {
        case this.STATE_OVERDUE:
          tasksFound = this.taskService.overdueTasksPageable(this.selectedDate, this.currentPage, this.inputValue);
          break;
  
        case this.STATE_PENDING:
          tasksFound = this.taskService.pendingTasksPageable(this.selectedDate, this.currentPage, this.inputValue);
          break;

          case this.STATE_COMPLETE:
          tasksFound = this.taskService.completeTasksPageable(this.currentPage, this.inputValue);
          break;

        default:
          tasksFound = this.taskService.listTasksPageable(this.currentPage, this.inputValue);
          break;
      }

      tasksFound.subscribe({
        next: (tasks) => {
          console.log(tasks);
          this.tittle = tasks.title;
          this.tasks = this.pagination.updatePageData(tasks.tasks);
          this.pagesRanges = this.pagination.pagesRanges;
          console.log("CURRENT PAGE: " + this.currentPage);
          
          // this.inputValue = '';
          this.errorMessage = '';
        },

        error: (err) => {
          this.tasks = [];
          console.log(err);

          this.tittle = err.title;
          this.errorMessage = err.message
        }
      });      
  }

  getPriorityColor(idPriority : number):string{
    
    switch(idPriority){
      case 1:
        return 'var(--red)'
      
      case 2:
        return 'var(--yellow)'

      case 3:
        return 'var(--green)'
      
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
