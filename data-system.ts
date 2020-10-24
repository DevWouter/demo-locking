interface DataLock {
    fieldIndex: number;
    clientId: number;
}

interface DataFreeze {
    fieldIndex: number;
    clientId: number;
}

export interface DataDto {
    width: number;
    height: number;
    fields: {
        value: number;
        lockedByClientId?: number;
        frozenByClientIds: number[];
    }[];
}

export class DataGrid {
    private readonly fields: number[] = [];
    private locks: DataLock[] = [];
    private frozen: DataFreeze[] = [];
    constructor(
        private readonly width: number,
        private readonly height: number,
    ) {
        for (let i = 0; i < width * height; i++) {
            this.fields.push(0);
        }
    }

    /**
     * Freezing a value prevents others from editing a value. 
     * Only when everybody has unfrozen the value it can be edited again
     * @param x The x-pos
     * @param y The y-pos
     * @param clientId The client that wants to prevent changing the value
     */
    freeze(x: number, y: number, clientId: number) {
        const index = this.getIndex(x, y);
        if (this.frozen.some(z => z.clientId === clientId && z.fieldIndex === index)) {
            console.warn(`Field ${index} is already frozen by client ${clientId}`);
            return;
        }
        this.frozen.push({ clientId: clientId, fieldIndex: index })
    }

    /**
     * Removes the freeze claim on a field so that it can be edited again
     * @param x The x-pos
     * @param y The y-pos
     * @param clientId The client that releases his claim
     */
    unfreeze(x: number, y: number, clientId: number) {
        // Unfreezing a value can only be done when the user.
        // No failure conditions
        const index = this.getIndex(x, y);

        const freezeIndex = this.frozen.findIndex(z => z.fieldIndex === index && z.clientId === clientId);
        if (freezeIndex === -1) {
            console.warn(`Client ${clientId} has no freeze claim on field ${index}`);
            return;
        }

        this.frozen.splice(freezeIndex, 1);
    }

    /**
     * Get an exclusive lock on a field.
     * @param x The x-pos
     * @param y The y-pos
     * @param clientId The client
     * @returns true when a lock was granted and false if someone else has the lock.
     */
    lock(x: number, y: number, clientId: number): boolean {
        // Locks can be aquired unless someone else has already acquired the lock
        const index = this.getIndex(x, y);
        var isLocked = this.locks.some(z => z.fieldIndex === index && z.clientId !== clientId);
        if (isLocked) {
            return false;
        }

        // Remove any previous lock the user might already have
        this.locks = this.locks.filter(z => z.fieldIndex !== index);
        this.locks.push({ clientId: clientId, fieldIndex: index });
        return true;
    }

    /**
     * Removes any lock and instantly gives the user a lock. It always succeeds
     * @param x The x-pos
     * @param y The y-pos
     * @param clientId The client
     */
    steal(x: number, y: number, clientId: number) {
        // Stealing a lock is a forceful unlock and then adding the lock.
        // It cannot fail.
        const index = this.getIndex(x, y);
        this.locks = this.locks.filter(z => z.fieldIndex !== index);
        this.lock(x, y, clientId);
    }

    /**
     * Sets the value of a field. It can fail if the field is frozen or locked by someone else
     * @param x The x-pos
     * @param y The y-pos
     * @param value The new value
     * @param clientId The client
     */
    setValue(x: number, y: number, value: number, clientId: number): "success" | "failed-no-lock" | "failed-frozen" {
        // Setting the value can only be done when client has an active lock and nobody has frozen the value.
        if (this.isFrozen(x, y)) return "failed-frozen";
        if (!this.hasLock(x, y, clientId)) return "failed-no-lock";
        const index = this.getIndex(x, y);
        this.fields[index] = value;
        return "success";
    }

    /**
     * Unlocks a field allowing others to acquire a lock
     * @param x The x-pos
     * @param y The y-pos
     * @param clientId The client
     */
    unlock(x: number, y: number, clientId: number) {
        // Unlocks by the user always succeed. There is no fail condition even if you don't have the lock 
        // since we communicate the entire state. This is different when we only communicate partial states as updates.
        const index = this.getIndex(x, y);
        const lockIndex = this.locks.findIndex(z => z.clientId === clientId && z.fieldIndex === index);
        if (lockIndex === -1) {
            return "no-lock";
        }
        this.locks.splice(lockIndex, 1);
        return "success";
    }

    /**
     * Returns a DTO that is shared with all clients
     */
    public getDto(): DataDto {
        return {
            width: this.width,
            height: this.height,
            fields: this.fields.map((v, i) => {
                var frozenIds = this.frozen.filter(z => z.fieldIndex == i).map(z => z.clientId);
                var lock = this.locks.find(z => z.fieldIndex == i);

                return {
                    value: v,
                    lockedByClientId: lock ? lock.clientId : null,
                    frozenByClientIds: frozenIds
                };
            }),
        };
    }

    private getIndex(x: number, y: number) {
        if (x < 0 || x >= this.width) throw new Error(`x is ${x} but needs to be between 0 and ${this.width}`);
        if (y < 0 || y >= this.height) throw new Error(`y is ${y} but needs to be between 0 and ${this.height}`);
        return y * this.width + x;
    }

    private isFrozen(x: number, y: number): boolean {
        const index = this.getIndex(x, y);
        return this.frozen.some(z => z.fieldIndex == index);
    }

    private hasLock(x: number, y: number, clientId: number): boolean {
        const index = this.getIndex(x, y);
        return this.locks.some(z => z.fieldIndex == index && z.clientId == clientId);
    }
}