export class CarError extends Error {
    public constructor(public message: string, public code: number, public id: number) {
        super();
    }
}
