export class MongoDataService {
  protected readonly DEF_PROP: any[];
  private readonly POPULATION_PROPS: any;

  constructor(populationProps) {
    this.POPULATION_PROPS = populationProps;
    this.DEF_PROP = Object.keys(populationProps).map((key) => ({
      path: key,
      select: populationProps[key],
    }));
  }

  refsToProps(refs: string[]) {
    const props = [];
    refs.forEach((ref) => {
      if (this.POPULATION_PROPS.hasOwnProperty(ref)) {
        props.push({
          path: ref,
          select: this.POPULATION_PROPS[ref],
        });
      }
    });
    return props;
  }
}
