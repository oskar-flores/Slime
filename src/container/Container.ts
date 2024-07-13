type Class = { new(...args: any[]): any };
type ClassAndDependencies = { aClass: Class; id: symbol; dependencies: symbol[] };

export class Container {
  private instances = new Map<symbol, unknown>();

  public bootstrap(...classes: Class[]): void {
    this.ensureAllClassesAreDecorated(classes);
    const classWithDeps = this.getClassMetadata(classes);
    const ordered = this.order(classWithDeps);
    this.instantiateAndSaveInstances(ordered);
  }

  public resolve<T>(token: string | symbol): T {
    const key = typeof token === "string" ? Symbol.for(token) : token;

    if (!this.instances.has(key)) {
      throw new Error(`No instance found for the given token`);
    }

    return this.instances.get(key) as T;
  }

  //Topological order using BFS and Kahn's algorithm
  //If there is a cycle in the graph, the algorithm will throw an error
  private order(classWithDeps: ClassAndDependencies[]): ClassAndDependencies[] {
    const inDegree = this.calculateIndegreeVector(classWithDeps);
    const classMap = new Map(classWithDeps.map(item => [item.id, item]));
    const ordered = this.transverse(classMap, inDegree);
    if (ordered.length !== classWithDeps.length) {
      throw new Error("Circular dependencies");
    }
    return ordered;
  }

  //BFS to transverse the graph
  private transverse(classWithDeps: Map<symbol, ClassAndDependencies>, inDegree: Map<symbol, number>): ClassAndDependencies[] {
    const queue = this.initializeQueue(inDegree);
    const ordered: ClassAndDependencies[] = [];
    while (queue.length > 0) {
      const currentKey = queue.shift()!;
      const nodeDeps = classWithDeps.get(currentKey);
      if (!nodeDeps) throw new Error(`Class ${String(currentKey)} not found`);

      ordered.push(nodeDeps);

      for (const dep of nodeDeps.dependencies) {
        const degree = inDegree.get(dep)! - 1;
        inDegree.set(dep, degree);
        if (degree === 0) {
          queue.push(dep);
        }
      }
    }
    return ordered;
  }

  private initializeQueue(inDegree: Map<symbol, number>): symbol[] {
    const queue = [];
    for (const [id, degree] of inDegree) {
      if (degree === 0) {
        queue.push(id);
      }
    }
    return queue;
  }

  private calculateIndegreeVector(classWithDeps: ClassAndDependencies[]): Map<symbol, number> {
    const inDegreeMap = new Map<symbol, number>();
    for (const aClass of classWithDeps) {
      if (aClass.dependencies.length === 0) inDegreeMap.set(aClass.id, 0);

      for (const deps of aClass.dependencies) {
        inDegreeMap.set(deps, (inDegreeMap.get(deps) ?? 0) + 1);
      }
    }
    return inDegreeMap;
  }

  private ensureAllClassesAreDecorated(classes: Class[]): void {
    const undecorated = classes
      .filter(aClass => !globalThis.injectableDecoratorMetadata.has(aClass))
      .map(c => c.name);

    if (undecorated.length) {
      throw new Error(`Classes [${undecorated}] are not decorated with @Injectable.`);
    }
  }

  private getClassMetadata(classes: Class[]): ClassAndDependencies[] {
    return classes.map(aClass => {
      const metadata = globalThis.injectableDecoratorMetadata.get(aClass);
      return { aClass, id: metadata!.id, dependencies: metadata!.dependencies };
    });
  }

  private instantiateAndSaveInstances(orderedClasses: ClassAndDependencies[]): void {
    for (const currentClass of orderedClasses) {
      const args = currentClass.dependencies?.map(depId => this.instances.get(depId));
      const instance = new currentClass.aClass(...args);
      this.instances.set(currentClass.id, instance);
    }
  }
}
