import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // afterEach(() => {
  //   // Asegúrate de que no haya solicitudes pendientes después de cada prueba.
  //   httpTestingController.verify();
  // });

  // it('should return title', () => {

  //   // const expectedTitle = 'Sample Title';
  //   const page = 1;
  //   const keyword = '';

  //   service.listTasksPageable(page, keyword).subscribe((task)=>{
  //     expect(task.title).toBeTruthy();
  //   })

  //   const req = httpTestingController.expectOne((request) =>
  //     request.url.endsWith(`/tasksPageable`)
  //   );

  //   req.flush({ title: 'Sample Title' }); // Proporciona un título no nulo

  //   expect(req.request.method).toBe('GET');
  // })
});
