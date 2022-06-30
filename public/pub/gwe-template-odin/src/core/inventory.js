let { GWE } = require('gwe');
let { EquipmentItem } = require('./equipment_item');
let { CommonItem } = require('./common_item');

const ITEM_STACK_MAX_CAPACITY = 99;

class Inventory extends GWE.ArrayCollection {
  constructor() {
    super();
  }

  async loadFromData(data) {
    for (let obj of data) {
      if (obj['ItemTypeName'] == 'CommonItem') {
        let item = new CommonItem();
        await item.loadFromFile('assets/models/' + obj['ItemId'] + '/data.json');
        item.setQuantity(obj['Quantity']);
        this.items.push(item);
      }
      else if (obj['ItemTypeName'] == 'EquipmentItem') {
        let item = new EquipmentItem();
        await item.loadFromFile('assets/models/' + obj['ItemId'] + '/data.json');
        item.setQuantity(obj['Quantity']);
        this.items.push(item);
      }
    }
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }

  getItemById(itemId) {
    return this.items.find(item => item.getId() == itemId);
  }

  findItemById(itemId) {
    return this.items.findIndex(item => item.getId() == itemId);
  }

  addItem(newItem) {
    let itemIndex = this.items.findIndex(item => item.getId() == newItem.id);

    if (itemIndex != -1) {
      let item = this.items[itemIndex];
      if (item.getQuantity() + newItem.getQuantity() > ITEM_STACK_MAX_CAPACITY) {
        return;
      }

      item.setQuantity(item.getQuantity() + newItem.getQuantity());
    }
    else {
      this.items.push(newItem);
      GWE.eventManager.emit(this, 'E_ITEM_ADDED', { item: newItem, index: this.items.indexOf(newItem) });
    }
  }

  removeItemById(itemId, quantity = 1) {
    let itemIndex = this.items.findIndex(item => item.getId() == itemId);
    if (itemIndex == -1) {
      return;
    }

    let item = this.items[itemIndex];
    let restQuantity = item.getQuantity() - quantity;

    if (restQuantity == 0) {
      this.items.splice(this.items.indexOf(item), 1);
      GWE.eventManager.emit(this, 'E_ITEM_REMOVED', { item: item, index: itemIndex });
    }
    else if (restQuantity > 0) {
      item.setQuantity(restQuantity);
    }
    else {
      return; // throw
    }

    return restQuantity;
  }
}

module.exports.Inventory = Inventory;