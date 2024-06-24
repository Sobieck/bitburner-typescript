import { NS } from "@ns";
import { ScriptRegistry } from "/scripts/scriptRegistry"

export async function main(ns: NS): Promise<void> {

  const totalTimeInMs = 2000

  if (ns.args.includes("clean")) {
    ns.run("scripts/utilities/dataClean.js")
    await ns.sleep(totalTimeInMs * 10)
  }

  if (ns.args.includes("invest")) {
    ns.run("scripts/investments/toggleInvestments.js")
    await ns.sleep(totalTimeInMs * 10)
  }

  ns.run("scripts/scriptRegistry.js")

  await ns.sleep(totalTimeInMs * 10)

  while (true) {

    const scriptRegistry: ScriptRegistry = JSON.parse(ns.read("data/scriptRegistry.txt"))
    const numberOfMsPerAction = totalTimeInMs / scriptRegistry.scriptsWithCost.length

    for (const script of scriptRegistry.scriptsToRun) {

      ns.run(script)
      await ns.sleep(numberOfMsPerAction)

    }
  }
}
