import { Draggable } from '../models/drag-drop-interfaces';
import { Component } from './base-component';
import { Project } from '../models/project';
import { autoBind } from '../decorators/autobind';

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  private project: Project;

  get manday() {
    if (this.project.manday < 20) {
      return this.project.manday.toString() + '人日'
    } else {
      return (this.project.manday / 20).toString() + '人月';
    }
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContents();
  }

  @autoBind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  };

  @autoBind
  dragEndHandler(_: DragEvent): void {
    
  };

  configure(){
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler)
  }
  
  renderContents(){
    const titleDOM = this.element.querySelector('h2')!;
    const mandayDOM = this.element.querySelector('h3')!;
    const descriptionDOM = this.element.querySelector('p')!;

    titleDOM.textContent = this.project.title;
    mandayDOM.textContent = this.manday;
    descriptionDOM.textContent = this.project.description
  }
}