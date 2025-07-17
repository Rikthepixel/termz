import fs from "fs/promises";
import * as z from "zod/mini";
import { Profile } from "../src/models/profile.ts";
import path from "path";

const dirname = typeof __dirname === "undefined" ? import.meta.dirname : __dirname;

async function run() {
    const schema = z.toJSONSchema(
        z.looseObject(Profile.shape).register(z.globalRegistry, {
            title: "Termz Schema",
            description: "Describes how the terminal sessions should be opened",
        }),
        {
            cycles: "ref",
            unrepresentable: "throw",
        },
    );

    const content = JSON.stringify(schema, null, 2);
    await fs.writeFile(path.resolve(dirname, "../schema.json"), content);
    const binExists = await fs
        .access(path.resolve(dirname, "../bin/"))
        .then(() => true)
        .catch(() => false);

    if (binExists) {
        await fs.writeFile(path.resolve(dirname, "../bin/schema.json"), content);
    }
}

run();
