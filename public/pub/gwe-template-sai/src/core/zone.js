class Zone extends Array {
  constructor(location) {
    super();
    this.location = location;
  }

  getLocation() {
    return this.location;
  }
}

module.exports.Zone = Zone;