import { NS, Player, Server } from "@ns";
import { PlayerWithWork } from "../character/characterController";

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
    act(): IAction;
}

export interface IAction {
    type: string
}

export class NoInvestmentAction implements IAction {
    type = "noInvestment"
}


class RemoteServerBase {
    protected calculateRamToBuy(player: Player, precalculatedValues: PrecalculatedValues) {
        let ramToBuy = 0;
        const ramCosts = precalculatedValues.remoteServerCosts.reverse();
        const playerMoney = player.money;

        for (const ramCost of ramCosts) {
            if (ramCost.cost <= playerMoney) {
                ramToBuy = ramCost.ram;
                break;
            }
        }
        return ramToBuy;
    }

    protected getPurchasedServers(environment: Server[]) {
        return environment
            .filter(x => x.purchasedByPlayer && x.hostname !== "home")

    }
}


class PurchaseServerFormula extends RemoteServerBase implements IActionFormula {
    constructor(private player: Player, private precalculatedValues: PrecalculatedValues, private environment: Server[]) {
        super()
    }

    act(): IAction {
        const purchasedServers = this.getPurchasedServers(this.environment)

        const numberOfPurchasedServers = purchasedServers.length

        if (!this.precalculatedValues.fileSystem.includes("data/ramConstrained.txt") ||
            this.precalculatedValues.purchasedServerLimit <= numberOfPurchasedServers) {
            return new NoInvestmentAction()
        }

        let ramToBuy = this.calculateRamToBuy(this.player, this.precalculatedValues);

        if (ramToBuy > 0) {
            const name = `REMOTE-${numberOfPurchasedServers.toString().padStart(3, "0")}`
            return new PurchaseServerAction(name, ramToBuy)
        }
        return new NoInvestmentAction()
    }
}
export class PurchaseServerAction implements IAction {
    type = "purchaseServer"

    constructor(public serverName: string, public ram: number) { }
}


class UpgradePurchasedServerFormula extends RemoteServerBase implements IActionFormula {
    constructor(private player: Player, private precalculatedValues: PrecalculatedValues, private environment: Server[]) {
        super()
    }

    act(): IAction {
        if (!this.precalculatedValues.fileSystem.includes("data/ramConstrained.txt")) {
            return new NoInvestmentAction()
        }

        let ramToBuy = this.calculateRamToBuy(this.player, this.precalculatedValues)

        if (ramToBuy > 0) {
            const serverWithLessRamThanPurchase = this.getPurchasedServers(this.environment)
                .find(x => x.maxRam < ramToBuy)

            if (serverWithLessRamThanPurchase) {
                return new UpgradePurchasedServerAction(serverWithLessRamThanPurchase.hostname, ramToBuy)
            }
        }

        return new NoInvestmentAction()
    }
}
export class UpgradePurchasedServerAction implements IAction {
    type = "upgradePurchasedServer"

    constructor(public serverName: string, public ram: number) { }
}






class UpgradeHomeFormula implements IActionFormula {
    constructor(private player: Player, private upgradeCost: number, private precalculatedValues: PrecalculatedValues, private successAction: IAction) { }

    act(): IAction {
        if (this.player.money > this.upgradeCost &&
            this.precalculatedValues.fileSystem.includes("data/ramConstrained.txt")) {

            return this.successAction

        }

        return new NoInvestmentAction()
    }
}
export class BuyHomeRamAction implements IAction {
    type = "buyHomeRam"
}
export class BuyHomeCoreAction implements IAction {
    type = "buyHomeCore"
}





class BuyProgramFormula implements IActionFormula {
    constructor(private programName: string, private hackingLevelToBuy: number, private player: Player, private precalculatedValues: PrecalculatedValues) { }

    act(): IAction {
        if (this.precalculatedValues.fileSystem.includes(this.programName)) {
            return new NoInvestmentAction()
        }

        if (this.player.skills.hacking >= this.hackingLevelToBuy) {
            if (!this.precalculatedValues.hasTor) {
                return new BuyTorAction()
            }

            return new BuyProgramAction(this.programName)
        }

        return new NoInvestmentAction()
    }
}
export class BuyTorAction implements IAction {
    type = "buyTor"
}
export class BuyProgramAction implements IAction {
    type = "buyProgram"

    constructor(public programName: string) { }
}




export class InvestmentsController {
    public action = new NoInvestmentAction()

    private actionFormulas: IActionFormula[] = []

    constructor(player: Player, precalculatedValues: PrecalculatedValues, environment: Server[]) {
        if (!precalculatedValues.fileSystem.includes("data/investAtWill.txt")) {
            return
        }

        this.actionFormulas.push(new BuyProgramFormula("BruteSSH.exe", 45, player, precalculatedValues))
        this.actionFormulas.push(new BuyProgramFormula("FTPCrack.exe", 90, player, precalculatedValues))
        this.actionFormulas.push(new BuyProgramFormula("relaySMTP.exe", 225, player, precalculatedValues))
        this.actionFormulas.push(new BuyProgramFormula("HTTPWorm.exe", 450, player, precalculatedValues))
        this.actionFormulas.push(new BuyProgramFormula("SQLInject.exe", 675, player, precalculatedValues))

        this.actionFormulas.push(new UpgradeHomeFormula(player, precalculatedValues.upgradeHomeCoresCost, precalculatedValues, new BuyHomeCoreAction()))
        this.actionFormulas.push(new UpgradeHomeFormula(player, precalculatedValues.upgradeHomeRamCost, precalculatedValues, new BuyHomeRamAction()))
        
        this.actionFormulas.push(new UpgradePurchasedServerFormula(player, precalculatedValues, environment))
        this.actionFormulas.push(new PurchaseServerFormula(player, precalculatedValues, environment))

        for (const formula of this.actionFormulas) {
            const result = formula.act()

            if (result.type !== new NoInvestmentAction().type) {
                this.action = result
                break;
            }
        }
    }
}


export async function main(ns: NS): Promise<void> {

    
    const player = getObjectFromFileSystem<Player>(ns, "data/player.txt")
    const precalculations = getObjectFromFileSystem<PrecalculatedValues>(ns, "data/precalculatedValues.txt")
    const environment = getObjectFromFileSystem<Server[]>(ns, "data/environment.txt")

    if (player && precalculations && environment){
        const controller = new InvestmentsController(player, precalculations, environment)

        const investmentActionFile = "data/investmentAction.txt"
        ns.rm(investmentActionFile)
        ns.write(investmentActionFile, JSON.stringify(controller.action))

        const actionsThatClearConstrainedRam = [
            new BuyHomeCoreAction().type,
            new BuyHomeRamAction().type,
            new UpgradePurchasedServerAction("",0).type,
            new PurchaseServerAction("",0).type
        ]

        if (actionsThatClearConstrainedRam.includes(controller.action.type)){
            ns.rm("data/ramConstrained.txt")
        }
    }

}

function getObjectFromFileSystem<T>(ns: NS, path: string) {
    let objectWeWant: T | undefined;

    if (ns.fileExists(path)){
        objectWeWant = JSON.parse(ns.read(path))
    }

    return objectWeWant
}