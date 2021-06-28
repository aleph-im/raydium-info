const overlay = {
    "11111111111111111111111111111111": {
        "address": "11111111111111111111111111111111",
        "name": "Native Solana",
        "decimals": 9,
        "symbol": "SOL",
        "logoURI": "https://ipfs.io/ipfs/Qmf1ChZ6kfVuhQUXusSrSBoppkTYeisAXXdDFR15LAyBDw"
    },
    "CsZ5LZkDS7h9TDKjrbL7VAwQZ9nsRu8vJLhRYfmGaN8K": {
        "address": "CsZ5LZkDS7h9TDKjrbL7VAwQZ9nsRu8vJLhRYfmGaN8K",
        "name": "Wrapped ALEPH (Sollet)",
        "decimals": 6,
        "symbol": "ALEPH",
        "logoURI": "https://ipfs.io/ipfs/QmQxzDZzQJJ4Jb1npvLYbXZjHDCyqywHWBADcJbGWJGEqW/Aleph.im%20-%20Token/Aleph.im-Token-v1.1.png"
    }
}

export function get_token(address, def) {
    if (overlay[address] !== undefined)
        return overlay[address]
    else
        return def
}