import { NS } from "@ns";
import { ScriptRegistry } from "/scripts/scriptRegistry"

export async function main(ns: NS): Promise<void> {

  const totalTimeInMs = 2_000

  if (ns.args[0] === "clean") {
    ns.run("scripts/utilities/dataClean.js")
    await ns.sleep(totalTimeInMs * 3)
  }

  ns.run("scripts/scriptRegistry.js")

  await ns.sleep(totalTimeInMs * 3)

  while (true) {

    const scriptRegistry: ScriptRegistry = JSON.parse(ns.read("data/scriptRegistry.txt"))
    const numberOfMsPerAction = totalTimeInMs / scriptRegistry.scriptsWithCost.length

    for (const script of scriptRegistry.scriptsToRun) {

      ns.run(script)
      await ns.sleep(numberOfMsPerAction)

    } 
  } 
}
