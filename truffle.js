const DEFAULT = {
  host: 'localhost',
  port: 8545,
  network_id: '*'
}


module.exports = {
  networks: {
    development: { 
      ...DEFAULT
    }
  }
};
