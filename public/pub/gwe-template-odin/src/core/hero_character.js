let { CharacterAbstract } = require('./character_abstract');
let { EquipmentItem } = require('./equipment_item');
let { ITEM_TYPE } = require('./enums');

class HeroCharacter extends CharacterAbstract {
  constructor() {
    super();
    this.weapon = null;
    this.helmet = null;
    this.armor = null;
    this.relic = null;
    this.allowedEquipmentItemSubTypes = [];
  }

  async loadFromData(data) {
    if (data['WeaponId']) {
      let weapon = new EquipmentItem();
      await weapon.loadFromFile('assets/models/' + data['WeaponId'] + '/data.json');
      this.setEquipment(weapon);
    }
    if (data['HelmetId']) {
      let helmet = new EquipmentItem();
      await helmet.loadFromFile('assets/models/' + data['HelmetId'] + '/data.json');
      this.setEquipment(helmet);
    }
    if (data['ArmorId']) {
      let armor = new EquipmentItem();
      await armor.loadFromFile('assets/models/' + data['ArmorId'] + '/data.json');
      this.setEquipment(armor);
    }
    if (data['RelicId']) {
      let relic = new EquipmentItem();
      await relic.loadFromFile('assets/models/' + data['RelicId'] + '/data.json');
      this.setEquipment(relic);
    }

    for (let subType of data['AllowedEquipmentItemSubTypes']) {
      this.allowedEquipmentItemSubTypes.push(subType);
    }

    super.loadFromData(data);
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }

  getWeapon() {
    return this.weapon;
  }

  getHelmet() {
    return this.helmet;
  }

  getArmor() {
    return this.armor;
  }

  getRelic() {
    return this.relic;
  }

  getAllowedEquipmentItemSubTypes() {
    return this.allowedEquipmentItemSubTypes;
  }

  isEquipableItem(item) {
    return item instanceof EquipmentItem && this.allowedEquipmentItemSubTypes.includes(item.getSubType());
  }

  getAttributesWith(equipmentItem) {
    let newAttributes = {};
    let oldEquipment = this.setEquipment(equipmentItem);

    for (let attributeKey in this.attributes.map) {
      newAttributes[attributeKey] = this.attributes.get(attributeKey);
    }

    if (oldEquipment) {
      this.setEquipment(oldEquipment);
    }
    else {
      this.removeEquipment(equipmentItem);
    }

    return newAttributes;
  }

  setEquipment(equipmentItem) {
    let oldEquipmentItem = null;
    if (equipmentItem.type == ITEM_TYPE.WEAPON) {
      oldEquipmentItem = this.weapon;
      this.weapon = equipmentItem;
    }
    else if (equipmentItem.type == ITEM_TYPE.HELMET) {
      oldEquipmentItem = this.helmet;
      this.helmet = equipmentItem;
    }
    else if (equipmentItem.type == ITEM_TYPE.ARMOR) {
      oldEquipmentItem = this.armor;
      this.armor = equipmentItem;
    }
    else if (equipmentItem.type == ITEM_TYPE.RELIC) {
      oldEquipmentItem = this.relic;
      this.relic = equipmentItem;
    }

    if (oldEquipmentItem) {
      this.attributes.removeModifiers(oldEquipmentItem.modifiers);
    }

    this.attributes.addModifiers(equipmentItem.modifiers);
    return oldEquipmentItem;
  }

  removeEquipment(equipmentItem) {
    if (equipmentItem == this.weapon) {
      this.attributes.removeModifiers(this.weapon.modifiers);
      this.weapon = null;
      return true;
    }
    else if (equipmentItem == this.helmet) {
      this.attributes.removeModifiers(this.helmet.modifiers);
      this.helmet = null;
      return true;
    }
    else if (equipmentItem == this.armor) {
      this.attributes.removeModifiers(this.armor.modifiers);
      this.armor = null;
      return true;
    }
    else if (equipmentItem == this.relic) {
      this.attributes.removeModifiers(this.relic.modifiers);
      this.relic = null;
      return true;
    }

    return false;
  }
}

module.exports.HeroCharacter = HeroCharacter;