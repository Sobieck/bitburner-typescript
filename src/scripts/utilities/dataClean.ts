import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const allData = ns.ls("home", "/data")

  allData.forEach(path => {
    ns.rm(path)
  });  
}
 