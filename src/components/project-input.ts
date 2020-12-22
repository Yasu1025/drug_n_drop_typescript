import { Component } from './base-component.js';
import * as Validate from '../utils/form-validation.js';
import { autoBind } from '../decorators/autobind.js';
import { projectState } from '../state/project-state.js';

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement > {
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

    const titleValidatable: Validate.Validatable = {
      value: inputedTitle,
      required: true
    }
    const descriptionValidatable: Validate.Validatable = {
      value: inputedDescription,
      required: true,
      minLength: 5
    }
    const mandayValidatable: Validate.Validatable = {
      value: +inputedManday,
      required: true,
      min: 1,
      max: 1000
    }

    if(
      !Validate.validate(titleValidatable) ||
      !Validate.validate(descriptionValidatable) ||
      !Validate.validate(mandayValidatable)
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