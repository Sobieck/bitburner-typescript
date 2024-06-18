import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const allScripts = ns.ls("home", "/data")

  allScripts.forEach(path => {
    ns.rm(path)
  }); 
}
 