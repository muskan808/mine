import React, { FC, ReactNode, useMemo, useCallback, useState } from 'react';
import { WalletAdapterNetwork, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
    GlowWalletAdapter,
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';

import '../src/css/bootstrap.css';
import '@solana/wallet-adapter-react-ui/styles.css';

const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new LedgerWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolletExtensionWalletAdapter(),
            new SolletWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [lamports, setLamports] = useState(0.1);
    const [wallet, setWallet] = useState("");

    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        const lamportsToSend = Math.floor(lamports * LAMPORTS_PER_SOL);

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey(wallet),
                lamports: lamportsToSend,
            })
        );

        const signature = await sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature, 'processed');
    }, [publicKey, sendTransaction, connection, lamports, wallet]);

    const handleLamportsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLamports(Number(e.target.value));
    };

    const handleWalletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWallet(e.target.value);
    };

    return (
        <div className="App">
            <div className="navbar">
                <div className="navbar-inner">
                    <a id="title" className="brand" href="#">Brand</a>
                    <ul className="nav"></ul>
                    <ul className="nav pull-right">
                        <li><a href="#">White Paper</a></li>
                        <li className="divider-vertical"></li>
                        <li><WalletMultiButton /></li>
                    </ul>
                </div>
            </div>
            <div className="content">
                <input
                    type="number"
                    value={lamports}
                    onChange={handleLamportsChange}
                    placeholder="Lamports to send"
                />
                <input
                    type="text"
                    value={wallet}
                    onChange={handleWalletChange}
                    placeholder="Recipient wallet address"
                />
                <button onClick={onClick}>Send Lamports</button>
            </div>
        </div>
    );
};

export default App;
