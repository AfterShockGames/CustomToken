const DEFAULT = {
    host: 'localhost',
    port: 8545,
    network_id: '*'
}

const GANACHE = {
    host: 'localhost',
    port: 8545,
    network_id: '*'
}

const TRAVIS = {
    host: 'localhost',
    port: 8545,
    network_id: '*'
}

module.exports = {
    networks: {
        development: { 
            ...DEFAULT
        },
        ganache: {
            ...GANACHE
        },
        travis: {
            ...TRAVIS
        }
    }
};
