import * as xrpl from 'xrpl';
import { Command, Option } from 'commander';
import { mainProcessor, roundUpToNearestXRP } from '../utils/utils';
import { addBaseOptions, addSkipPromptOption } from '../utils/cli-utils';
import { printInfo, printWarn } from '../common';

const MAX_CLAIMABLE_DROPS = 1000000000;

/**
 * XRPL 테스트넷 faucet에서 지정한 지갑으로 XRP를 요청하는 스크립트입니다.
 * - 기본 지갑 또는 recipient 옵션으로 지정한 주소에 XRP를 지급합니다.
 *
 * [주요 옵션]
 *   --recipient <address> : XRP를 받을 주소(기본값: 활성 지갑)
 *   --amount <amount>     : 요청할 XRP 수량(기본값: 100)
 *   --minBalance <amount> : 최소 잔고(기본값: 1)
 *
 * [실행 예시]
 *   npx ts-node src/wallet/faucet.ts --recipient r... --amount 100
 */
async function faucet(_config: any, wallet: xrpl.Wallet, client: any, _chain: any, options: { recipient?: string; amount: string; minBalance: string; yes: boolean }): Promise<void> {
    const recipient = options.recipient || wallet.address;
    const { balance: recipientBalance } = await client.accountInfo(recipient);
    const amountInDrops = xrpl.xrpToDrops(options.amount);
    const recipientBalanceInXrp = xrpl.dropsToXrp(recipientBalance);
    const isDifferentRecipient = wallet.address.toLowerCase() !== recipient.toLowerCase();

    let fee = '0';

    if (isDifferentRecipient) {
        printInfo(`Requesting funds for`, recipient);
        fee = await client.fee();
    }

    if (Number(recipientBalanceInXrp) >= Number(options.minBalance)) {
        printWarn(`Recipient balance (${recipientBalanceInXrp} XRP) above minimum, skipping faucet request`);
        process.exit(0);
    }

    const amountToClaim = roundUpToNearestXRP(Number(amountInDrops) + Number(fee));

    if (amountToClaim > MAX_CLAIMABLE_DROPS) {
        printWarn(`Amount too high, maximum is ${(MAX_CLAIMABLE_DROPS - Number(fee)) / 1e6} XRP`);
        process.exit(0);
    }

    printInfo(`Funding active wallet ${wallet.address} with`, `${amountToClaim / 1e6} XRP`);
    await client.fundWallet(wallet, String(amountToClaim / 1e6));

    if (isDifferentRecipient) {
        printInfo(`Transferring ${options.amount} XRP from active wallet to recipient`, recipient);
        await client.sendPayment(
            wallet,
            {
                destination: recipient,
                amount: amountInDrops,
                fee,
            },
            options,
        );
    }

    printInfo('Funds sent', recipient);
}

if (require.main === module) {
    const program = new Command();

    program
        .name('faucet')
        .addOption(new Option('--recipient <recipient>', 'recipient to request funds for (default: wallet address)'))
        .addOption(new Option('--amount <amount>', 'amount of XRP tokens to request from the faucet').default('100'))
        .addOption(
            new Option(
                '--minBalance <amount>',
                'tokens will only be requested from the faucet if recipient XRP balance is below the amount provided',
            ).default('1'),
        )
        .description('Query the faucet for funds.')
        .action((options) => {
            mainProcessor(faucet, options, []);
        });

    addBaseOptions(program);
    addSkipPromptOption(program);

    program.parse();
}

export { faucet };