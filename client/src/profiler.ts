export class Profiler {
    private lastTime: Date;
    private startTime: Date;
    constructor() {
        this.lastTime = new Date();
        this.startTime = new Date();
    }

    public measureSinceLast(message = "Time:") {
        const currentTime = this.measureFrom(message, this.lastTime);
    }

    public measureSinceStart(message = "Time:") {
        this.measureFrom(message, this.startTime);
    }

    private measureFrom(message = "Time:", previous) {
        const currentTime = new Date();
        const delta = currentTime.getTime() - previous.getTime();
        // tslint:disable-next-line: no-console
        console.log(`${delta / 1000} - ${message}`);
        this.lastTime = currentTime;
        return currentTime;
    }
}
