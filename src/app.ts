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


class ProjectInput {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  element: HTMLFormElement;
  titleInputEl: HTMLInputElement;
  descriptionInputEl: HTMLInputElement;
  mandayInputEl: HTMLInputElement;

  constructor() {
    this.templateEl = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostEl = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.templateEl.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;

    this.titleInputEl = this.element.querySelector('#title')! as HTMLInputElement;
    this.descriptionInputEl = this.element.querySelector('#description')! as HTMLInputElement;
    this.mandayInputEl = this.element.querySelector('#manday')! as HTMLInputElement;


    this.configure();
    this.attachNode();
  }

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
      console.log(title, description, manday);
      this.clearInput();
    }
  }

  private configure() {
    this.element.addEventListener('submit', this.submitHandler)
  }

  private attachNode() {
    this.hostEl.insertAdjacentElement('afterbegin', this.element);
  }
};

const prjInput = new ProjectInput();