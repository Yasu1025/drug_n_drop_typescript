export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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