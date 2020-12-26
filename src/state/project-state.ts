import { Project, ProjectStatus } from '../models/project';

// Project state Management
type Listener<T> = (item: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];
  addListeners(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

export class ProjectState extends State<Project>{
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super()
  }

  static getInstance() {
    if(this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, manday: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      manday,
      ProjectStatus.Active
    );

    this.projects.push(newProject);

    this.exeListners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {

    const movedProject = this.projects.find(project => project.id === projectId);
    if(movedProject && movedProject.status !== newStatus) {
      movedProject.status = newStatus;
    }

    this.exeListners();
  }

  private exeListners() {
    for(const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
};

export const projectState = ProjectState.getInstance();
