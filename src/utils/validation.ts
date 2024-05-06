import { Infer, Struct, StructError, validate as validateStruct } from "superstruct";
import { Result, err, ok } from "./result";

export function validate<TStruct extends Struct<any>>(
    content: unknown,
    schema: TStruct,
    coerce: boolean = false,
): Result<Infer<TStruct>, StructError> {
    const validationResult = validateStruct(content, schema, { coerce });
    if (validationResult[0]) return err(validationResult[0]);
    return ok(validationResult[1]);
}
