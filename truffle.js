const DEFAULT = {
  host: 'localhost',
  port: 7545,
  network_id: '*'
}


module.exports = {
  networks: {
    development: { 
      ...DEFAULT
    }
  }
};
