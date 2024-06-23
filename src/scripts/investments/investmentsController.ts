import { NS, Player, Server } from "@ns";

type ServerMemoryWithCost = {
    ram: number;
    cost: number;
}

export type PrecalculatedValues = {
    remoteServerCosts: ServerMemoryWithCost[];
    upgradeHomeRamCost: number;
    upgradeHomeCoresCost: number;
    purchasedServerLimit: number;
    fileSystem: string[];
    hasTor: boolean;
}

interface IActionFormula {
    act(player: Player, precalculatedValues: PrecalculatedValues, environment: Server[]): IAction;
}

export interface IAction {
    type: string
}

export class NoInvestmentAction implements IAction {
    type = "noInvestment"
}

export class BuyTorAction implements IAction {
    type = "buyTor"
}

export class BuyProgramAction implements IAction {
    type = "buyProgram"

    constructor(public programName: string) { }
}

class BuyProgramFormula implements IActionFormula {
    constructor(private programName: string, private hackingLevelToBuy: number) { }

    act(player: Player, precalculatedValues: PrecalculatedValues, environment: Server[]): IAction {
        if (precalculatedValues.fileSystem.includes(this.programName)) {
            return new NoInvestmentAction()
        }

        if (player.skills.hacking >= this.hackingLevelToBuy) {
            if (!precalculatedValues.hasTor) {
                return new BuyTorAction()
            }

            return new BuyProgramAction(this.programName)
        }

        return new NoInvestmentAction()
    }
}

export class InvestmentsController {
    public action = new NoInvestmentAction()

    private actionFormulas = [
        new BuyProgramFormula("BruteSSH.exe", 45),
        new BuyProgramFormula("FTPCrack.exe", 90),
        new BuyProgramFormula("relaySMTP.exe", 225),
        new BuyProgramFormula("HTTPWorm.exe", 450),
        new BuyProgramFormula("SQLInject.exe", 675),
        // upgrade local cpu
        // upgrade local ram
        // upgrade server
        // create new server
    ]

    constructor(player: Player, precalculatedValues: PrecalculatedValues, environment: Server[]) {
        if (!precalculatedValues.fileSystem.includes("data/investAtWill.txt")) {
            return
        }

        for (const formula of this.actionFormulas) {
            const result = formula.act(player, precalculatedValues, environment)

            if (result.type !== new NoInvestmentAction().type) {
                this.action = result
                break;
            }
        }
    }
}


export async function main(ns: NS): Promise<void> {



}