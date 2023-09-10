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
  inputValue: string;
  errorMessage: string = '';
  tittle = 'All tasks'
  firstLoad = true;
  private flatpickrInstance: flatpickr.Instance;

  constructor(private taskService: TaskService, private pagination: Pagination, private route : ActivatedRoute, private dataSharingService:DataSharingService){ }
  
  @ViewChild('taskList', {static:true}) taskList!: ElementRef<HTMLUListElement>;

  ngOnInit(): void {
    this.initFlatpickr();
    this.selectedDate = Task.getFormatDateTime(new Date());
    
    this.subscriptions.push(
      this.route.paramMap.subscribe((params) => {
        if (!this.firstLoad) {
          console.log("TIPO DE CARGAR: loadPageData por parametro page");
          this.state = this.route.snapshot.data['state'];
          this.currentPage = parseInt(params.get('page')) || 0
          this.loadPageData();
          this.tittle = 'Tasks ' + this.state.charAt(0).toUpperCase() + this.state.slice(1);

        }
      })
    );

    // this.route.paramMap.subscribe((params) => {
    //     if(! this.firstLoad){
    //       console.log("TIPO DE CARGAR: loadPageData por parametro page");
    //       this.state = this.route.snapshot.data['state'];
    //       this.currentPage = parseInt(params.get('page')) || 0
    //       this.loadPageData();
    //     }
    //   });

    this.firstLoad = false;
    
    // if(!this.firstLoad){
    //   this.dataSharingService.inputValue$.subscribe(value => {
    //     console.log("TIPO DE CARGAR: loadPageData por busqueda en la barra");
    //       this.inputValue = value;
    //       console.log('this.inputValue: ' + this.inputValue);

          
    //       this.state = this.route.snapshot.data['state'];
    //       this.currentPage = 0
          
    //       this.loadPageData();
    //   })
    // }

    this.subscriptions.push(
      this.dataSharingService.inputValue$
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe((value) => {
          console.log("TIPO DE CARGAR: loadPageData por busqueda en la barra");
          this.inputValue = value;
          console.log('this.inputValue: ' + this.inputValue);

          
          this.state = this.route.snapshot.data['state'];
          this.currentPage = 0
          this.tittle = 'Tasks ' + this.state.charAt(0).toUpperCase() + this.state.slice(1);
          
          this.loadPageData();
        })
    );

    console.log('ROUTER SNAPSHOT:' + this.state);
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
    
  }

  filterByDate() : void{
    this.currentPage = 0;
    this.selectedDate = Task.getFormatDateTime(new Date(this.selectedDate));
    this.loadPageData();
  }

  private loadPageData(): void {
        
      let tasksFound : Observable<TaskResponse>;
      console.log('STATE: ' + this.state);
      
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
          tasksFound = this.taskService.listTasksPageable(this.currentPage, this.inputValue);
          break;
      }

      tasksFound.subscribe({
        next: (tasks) => {
          console.log(tasks);
          
          this.tasks = this.pagination.updatePageData(tasks);
          this.pagesRanges = this.pagination.pagesRanges;
        },

        error: (err) => {
          console.log(err);
          this.errorMessage = err
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
