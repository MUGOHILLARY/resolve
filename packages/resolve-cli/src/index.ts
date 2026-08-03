
import { Command } from "commander";

import { newCategory } from "./commands/newCategory.js";

import { doctor } from "./commands/doctor.js";


const program = new Command();

program
  .name("resolve")
  .description("Resolve Developer CLI")
  .version("1.0.0");

program
  .command("hello")
  .action(() => {

    console.log("🚀 Resolve CLI is working!");

  });

program
  .command("new-category")

  .argument("<name>")

  .description("Create a new blocklist category")

  .action(async (name) => {

    await newCategory(name);

  });

program
  .command("doctor")
  .description("Check the Resolve workspace")
  .action(async () => {
    await doctor();
  });

program.parse();