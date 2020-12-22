import { Component } from './base-component.js';
import { ProjectItem } from './project-item.js'
import { Project, ProjectStatus } from '../models/project.js';
import { Droppable } from '../models/drag-drop-interfaces.js' 
import { autoBind } from '../decorators/autobind.js';
import { projectState } from '../state/project-state.js';


export class ProjectList extends Component< HTMLDivElement, HTMLElement > implements Droppable {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContents();
  }

  @autoBind
  dragOverHandler(event: DragEvent): void {
    if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const targetEl = this.element.querySelector('ul')!;
      targetEl.classList.add('droppable');
    }
  };

  @autoBind
  dropHandler(event: DragEvent): void {
    const droppedPrjId = event.dataTransfer!.getData('text/plain');
    const targetType = this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished;
    projectState.moveProject(droppedPrjId, targetType);
  };

  @autoBind
  dragLeaveHandler(_: DragEvent): void {
    const targetEl = this.element.querySelector('ul')!;
    targetEl.classList.remove('droppable');
  };

  configure() {

    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('drop', this.dropHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);

    projectState.addListeners((projects: Project[]) => {
      const relevantProjects = projects.filter(project => {
        if(this.type === 'active') {
          return project.status === ProjectStatus.Active;
        }
        return project.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    })
  }

  renderContents() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type === 'active' ? 'ACTIVE PROJECT' : 'FINISHED PROJECT' ;
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listEl.innerHTML = '';
    for(const project of this.assignedProjects) {
      new ProjectItem(listEl.id, project);
    }
  }

};