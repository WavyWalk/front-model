import { Thenable } from "es6-promise";
export declare class DefferedPromise<T> {
    promise: Promise<T>;
    innerResolve: (value: T) => void;
    innerReject: (reason: any) => void;
    lastThen: Promise<any>;
    resolve(value: T): void;
    reject(reason: any): void;
    constructor();
    getPromise(): Promise<T>;
    then(callback: (value: T) => void): Thenable<any>;
    catch(callback: (reason: any) => void): Thenable<any>;
}
//# sourceMappingURL=DeferredPromise.d.ts.map