import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {

  const pathToRecords = "data/basicHackingOrchistratorRecords.txt"

  let cumulativeAttackRecords: CumulativeAttackRecords | undefined;

  if (ns.fileExists(pathToRecords)) {
    cumulativeAttackRecords = JSON.parse(ns.read(pathToRecords)) as CumulativeAttackRecords

    cumulativeAttackRecords.attackRecords.forEach(attack => {
      if (attack.pid !== undefined) {
        attack.isRunning = ns.isRunning(attack.pid)
      }
    });
  }

  const servers: Server[] = JSON.parse(ns.read("data/environment.txt"))
  const ramReservedOnHome: number = JSON.parse(ns.read("data/scriptRegistry.txt")).ramReservedOnHome


  const controller = new AdvancedHackingOrchistratorController(servers, ramReservedOnHome, cumulativeAttackRecords)

  for (const actionRecord of controller.cumulativeAttackRecords.attackRecords) {
    if (!actionRecord.commandSent) {

      const pid = ns.exec(
        controller.cumulativeAttackRecords.action,
        actionRecord.attackingHostname,
        actionRecord.treadCount,
        controller.cumulativeAttackRecords.victimHostname)

      actionRecord.addPid(pid)
    }
  }

  ns.rm(pathToRecords)
  ns.write(pathToRecords, JSON.stringify(controller.cumulativeAttackRecords))

}

export enum HackingAction {
  Hack = "scripts/hacking/hack.js",
  Weaken = "scripts/hacking/weaken.js",
  Grow = "scripts/hacking/grow.js",
  Idle = "idle"
}

export class AttackRecord {
  constructor(public attackingHostname: string, public treadCount: number) { }

  public isRunning = false
  public commandSent = false

  public pid: number | undefined;
  public timeStarted: Date | undefined;


  public addPid(pid: number) {
    this.pid = pid

    this.timeStarted = new Date(Date.now())
    this.isRunning = true
    this.commandSent = true
  }
}

export class CumulativeAttackRecords {
  constructor(public victimHostname: string) { }

  public attackRecords: AttackRecord[] = []
  public action = HackingAction.Idle

}

export class AdvancedHackingOrchistratorController {
  private weakenOrGrowCost = 1.75
  private hackCost = 1.7

  public cumulativeAttackRecords: CumulativeAttackRecords;

  constructor(servers: Server[], ramReservedOnHome: number, inputcumulativeAttackRecords?: CumulativeAttackRecords) {
    if (inputcumulativeAttackRecords) {
      inputcumulativeAttackRecords.attackRecords = inputcumulativeAttackRecords.attackRecords.filter(x => x.isRunning)
      this.cumulativeAttackRecords = inputcumulativeAttackRecords

      if (this.cumulativeAttackRecords.attackRecords.length === 0) {
        if (this.cumulativeAttackRecords.action === HackingAction.Hack) {
          const potentialNewAction = this.selectAction(servers, this.cumulativeAttackRecords.victimHostname)

          if(potentialNewAction !== HackingAction.Hack){
            this.cumulativeAttackRecords = this.selectNewVictim(servers)
          }
        }

        this.cumulativeAttackRecords.action = HackingAction.Idle
      }
    } else {
      this.cumulativeAttackRecords = this.selectNewVictim(servers)
    }

    if (this.cumulativeAttackRecords.action === HackingAction.Idle) {
      this.cumulativeAttackRecords.action = this.selectAction(servers, this.cumulativeAttackRecords.victimHostname)

      let ramCost = this.weakenOrGrowCost

      if (this.cumulativeAttackRecords.action === HackingAction.Hack) {
        ramCost = this.hackCost
      }

      for (const server of servers.filter(x => x.hasAdminRights)) {
        if (server.hostname === "home") {
          server.maxRam = server.maxRam - ramReservedOnHome
        }

        const threads = Math.floor(server.maxRam / ramCost)
        if (threads > 0){
          this.cumulativeAttackRecords.attackRecords.push(new AttackRecord(server.hostname, threads))
        }        
      }
    }
  }

  private selectAction(servers: Server[], victimHostname: string) {
    const serverToAttack = servers.find(x => x.hostname === victimHostname)!

    if (serverToAttack.hackDifficulty! > serverToAttack.minDifficulty! + 5) {
      return HackingAction.Weaken
    } else if (serverToAttack.moneyAvailable! < serverToAttack.moneyMax! * .75) {
      return HackingAction.Grow
    } else {
      return HackingAction.Hack
    }
  }

  private selectNewVictim(servers: Server[]) {
    const targetServer =
      servers
        .filter(x => x.hasAdminRights && !x.purchasedByPlayer)
        .sort((a, b) => b.moneyMax! - a.moneyMax!)

    const victimHostname = targetServer[0].hostname
    return new CumulativeAttackRecords(victimHostname)
  }
}
