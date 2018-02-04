const DEFAULT = {
  host: 'localhost',
  port: 9545,
  network_id: '*'
}


module.exports = {
  networks: {
    development: { 
      ...DEFAULT
    }
  }
};
