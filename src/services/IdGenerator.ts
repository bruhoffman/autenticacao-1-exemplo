import { v4 } from "uuid"

export class IdGenerator {
    public generate = (): string => {
        return v4() // uuid do tipo v4
    }
}