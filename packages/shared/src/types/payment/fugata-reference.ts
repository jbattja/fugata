export class FugataReference {
    private static counter: number = 0;
    private static readonly MAX_COUNTER = 999;
    private static readonly COUNTER_PADDING = 3;

    private static serverId = process.env.FUGATA_SERVER_ID || 'FG-001';

    /**
     * Generates a unique reference string in the format: SERVER_ID-EPOCH_TIMESTAMP-COUNTER
     * @param serverId The server identifier from environment variables
     * @returns A unique reference string
     */
    public static generateReference(): string {
        const timestamp = Date.now();
        const paddedCounter = this.getNextCounter().toString().padStart(this.COUNTER_PADDING, '0');
        
        return `${this.serverId}-${timestamp}-${paddedCounter}`;
    }

    /**
     * Gets the next counter value and handles reset when reaching max
     * @returns The next counter value
     */
    private static getNextCounter(): number {
        this.counter = (this.counter + 1) % (this.MAX_COUNTER + 1);
        return this.counter;
    }

    /**
     * Resets the counter to 0
     */
    public static resetCounter(): void {
        this.counter = 0;
    }
}
