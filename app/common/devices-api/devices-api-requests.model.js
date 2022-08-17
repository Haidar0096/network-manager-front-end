class AddDeviceRequest {
  constructor(deviceName) {
    this.Name = deviceName;
  }
}

class UpdateDeviceRequest {
  constructor(deviceId, deviceName) {
    this.Id = deviceId;
    this.Name = deviceName;
  }
}

class GetDevicesPaginatedRequest {
  constructor(offset, count) {
    this.offset = offset;
    this.count = count;
  }
}
