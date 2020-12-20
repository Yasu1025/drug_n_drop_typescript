// Project state Management
type Listener<T> = (item: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];
  addListeners(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project>{
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

    for(const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
};

const projectState = ProjectState.getInstance();

enum ProjectStatus {
  Active = 'active',
  Finished = 'finished'
};

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public manday: number,
    public status: ProjectStatus
  ) {}
}


// Validate
interface Validatable {
  value: string | number,
  required?: boolean,
  minLength?: number,
  maxLength?: number,
  min?: number,
  max?: number
}

function validate(validateInput: Validatable) {
  let isValid = true;
  if(validateInput.required) {
    isValid = isValid && validateInput.value.toString().trim().length !== 0;
  };
  if(validateInput.minLength && typeof validateInput.value === 'string') {
    isValid = isValid && validateInput.value.length >= validateInput.minLength;
  };
  if(validateInput.maxLength && typeof validateInput.value === 'string') {
    isValid = isValid && validateInput.value.length <= validateInput.maxLength;
  };
  if(validateInput.min && typeof validateInput.value === 'number') {
    isValid = isValid && validateInput.value >= validateInput.min;
  };
  if(validateInput.max && typeof validateInput.value === 'number') {
    isValid = isValid && validateInput.value <= validateInput.max;
  };

  return isValid;
}

// auto bind decorator
function autoBind(_target: any, _methodName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn
    }
  }

  return adjDescriptor;
};

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateEl: HTMLTemplateElement;
  hostEl: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string,
  ) {
    this.templateEl = document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostEl = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(this.templateEl.content, true);
    this.element = importedNode.firstElementChild as U;
    if(newElementId) {
      this.element.id = newElementId;
    };

    this.attachNode(insertAtStart);
  }

  abstract configure(): void;
  abstract renderContents(): void;

  private attachNode(insertAtBegining: boolean) {
    const whereToInsert = insertAtBegining ? 'afterbegin' : 'beforeend';
    this.hostEl.insertAdjacentElement(whereToInsert, this.element);
  }


};


class ProjectList extends Component< HTMLDivElement, HTMLElement > {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContents();
  }

  configure() {
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
      const listItem = document.createElement('li');
      listItem.textContent = project.title;
      listEl.appendChild(listItem);
    }
  }

};

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement > {
  titleInputEl: HTMLInputElement;
  descriptionInputEl: HTMLInputElement;
  mandayInputEl: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true);

    this.titleInputEl = this.element.querySelector('#title')! as HTMLInputElement;
    this.descriptionInputEl = this.element.querySelector('#description')! as HTMLInputElement;
    this.mandayInputEl = this.element.querySelector('#manday')! as HTMLInputElement;

    this.configure();
  }

  configure() {
    this.element.addEventListener('submit', this.submitHandler)
  }

  renderContents(){}

  private gatherUserInputValue(): [string, string, number] | void {
    const inputedTitle = this.titleInputEl.value;
    const inputedDescription = this.descriptionInputEl.value;
    const inputedManday = this.mandayInputEl.value;

    const titleValidatable: Validatable = {
      value: inputedTitle,
      required: true
    }
    const descriptionValidatable: Validatable = {
      value: inputedDescription,
      required: true,
      minLength: 5
    }
    const mandayValidatable: Validatable = {
      value: +inputedManday,
      required: true,
      min: 1,
      max: 1000
    }

    if(
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(mandayValidatable)
    ) {
      alert('Wrong Value entered...');
      return;
    } else {
      return [
        inputedTitle,
        inputedDescription,
        +inputedManday
      ]
    }
  }

  private clearInput() {
    this.titleInputEl.value = '';
    this.descriptionInputEl.value = '';
    this.mandayInputEl.value = '';
  }

  @autoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInputvalue = this.gatherUserInputValue();
    if(Array.isArray(userInputvalue)) {
      const [title, description, manday] = userInputvalue;
      projectState.addProject(title, description, manday);
      this.clearInput();
    }
  }

};


const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');