import * as xrpl from 'xrpl';
import { Command, Option } from 'commander';
import { mainProcessor, roundUpToNearestXRP } from './utils';
import { addBaseOptions, addSkipPromptOption } from './cli-utils';
import { printInfo, printWarn } from '../common';

const MAX_CLAIMABLE_DROPS = 1000000000;

/**
 * XRPL faucet에서 자금을 요청하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param _chain - 체인 정보 (사용하지 않음)
 * @param options - 옵션 객체 (recipient, amount, minBalance, yes 포함)
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