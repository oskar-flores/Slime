
type Class = { new(...args: any[]): any };
type ClassWithDependencies = { cls: Class; id: string; dependencies: string[] };

export class Container {
    private instances: Map<string, unknown> = new Map<string, unknown>();

    public init(...classes: Class[]): void {

        // ensure all classes have been decorated with @Injectable
        const undecorated = classes.filter((aClass) => !globalThis.injectableDecoratorMetadata.has(aClass)).map((c) => c.name);
        if (undecorated.length) {
            throw new Error(`Classes [${undecorated}] are not decorated with @Injectable.`);
        }

        //Validate classes
        const classWithDeps = classes.map(cls => {
            const metadata = globalThis.injectableDecoratorMetadata.get(cls);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return {
                cls,
                id: metadata!.id,
                dependencies: metadata!.dependencies
            }
        });

        //topological sort for the classes
        const ordered = this.order(classWithDeps);
        for (const currentClass of ordered) {
            //get arguments
            const args = currentClass.dependencies?.map(depId => this.instances.get(depId));
            //create instance
            // @ts-ignore
            const instance = new currentClass.cls(...args);
            //save instance
            this.instances.set(currentClass.id, instance);
        }
    }


    public resolve<T>(id: string): T {
        if (!this.instances.has(id)) {
            throw new Error();
        }
        return this.instances.get(id) as T;
    }


    //Topological order using BFS and Kahn's algorithm
    //If there is a cycle in the graph, the algorithm will throw an error
    private order(classWithDeps: ClassWithDependencies[]): ClassWithDependencies[] {
        const inDegree = this.calculateIndegreeVector(classWithDeps);
        const classMap = new Map(classWithDeps.map(item => [item.id, item]));
        const ordered = this.transverse(classMap, inDegree);
        if (ordered.length !== classWithDeps.length) {
            throw new Error("Circular dependencies")
        }
        return ordered;

    }

    //BFS to transverse the graph
    private transverse(classWithDeps: Map<string, ClassWithDependencies>, inDegree: Map<string, number>): ClassWithDependencies[] {
        const queue = this.initializeQueue(inDegree);
        const ordered: ClassWithDependencies[] = [];
        while (queue.length > 0) {
            const currentKey = queue.shift()!;
            const nodeDeps = classWithDeps.get(currentKey);
            if (!nodeDeps) throw new Error(`Class ${currentKey} not found`)

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

    private initializeQueue(inDegree: Map<string, number>): string[] {
        const queue = []
        for (const [id, degree] of inDegree) {
            if (degree === 0) {
                queue.push(id);
            }
        }
        return queue;
    }


    private calculateIndegreeVector(classWithDeps: ClassWithDependencies[]): Map<string, number> {
        const inDegreeMap = new Map<string, number>();
        for (const aClass of classWithDeps) {
            if (aClass.dependencies.length === 0) inDegreeMap.set(aClass.id, 0);

            for (const deps of aClass.dependencies) {
                inDegreeMap.set(deps, (inDegreeMap.get(deps) ?? 0) + 1);
            }
        }
        return inDegreeMap;
    }
}