import { Server } from "@ns";



export class MockServer implements Server {
    constructor(public hostname: string) { }
    ip: string = "";
    sshPortOpen: boolean = false;
    ftpPortOpen: boolean = false;
    smtpPortOpen: boolean = true;
    httpPortOpen: boolean = false;
    sqlPortOpen: boolean = false;
    hasAdminRights: boolean = false;
    cpuCores: number = 123;
    isConnectedTo: boolean = true;
    ramUsed: number = 12;
    maxRam: number = 25;
    organizationName: string = "asdf";
    purchasedByPlayer: boolean = false;
    backdoorInstalled?: boolean | undefined;
    baseDifficulty?: number | undefined;
    hackDifficulty?: number | undefined;
    minDifficulty?: number | undefined;
    moneyAvailable?: number | undefined;
    moneyMax?: number | undefined;
    numOpenPortsRequired?: number | undefined;
    openPortCount?: number | undefined;
    requiredHackingSkill?: number | undefined;
    serverGrowth?: number | undefined;
}
