import { useState } from "@inquirer/core";

export type History<T> = {
    canUndo: boolean;
    canRedo: boolean;

    test: string;
    undo(): History<T>;
    redo(): History<T>;
    push(value: T): History<T>;
};

export function useHistory<T>(initial: T | (() => T)) {
    const [changes, setChanges] = useState<T[]>(() => {
        return [initial instanceof Function ? initial() : initial];
    });
    const [position, setPosition] = useState<number>(0);

    const history: History<T> = {
        canUndo: position !== 0,
        canRedo: position !== changes.length - 1,

        test: [JSON.stringify(changes, null, 2), position].join("\n"),

        push(value: T) {
            const newChanges = changes.slice(0, position + 1); // Copy array and remove redos
            newChanges.push(value);

            setChanges(newChanges);
            setPosition(newChanges.length - 1);
            return history;
        },

        undo() {
            if (position === 0) return history; // Nothing to undo
            setPosition(position - 1);
            return history;
        },

        redo() {
            if (position === changes.length - 1) return history; // Already at latest version
            setPosition(position + 1);
            return history;
        },
    };

    return [changes[position], history] as const;
}
