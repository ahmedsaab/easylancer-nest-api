// helper functions and interfaces here

export interface IDeferredAction {
  method: (...T) => void;
  params: any[];
}

export class DeferredActionsQueue {
  private readonly actions: IDeferredAction[];

  constructor() {
    this.actions = [];
  }

  public queue(action: IDeferredAction) {
    this.actions.push(action);
  }

  public execute() {
    this.actions.forEach((action: IDeferredAction) => {
      action.method(...action.params);
    });
  }
}
