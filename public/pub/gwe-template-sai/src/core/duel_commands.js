let { PHASE, LOCATION } = require('./enums');
let {  DirectAttackAction, DrawAction, SummonAction, SetAction, ChangePositionAction, BattleAction, NextPhaseAction, ActivateAction } = require('./duel_actions');

class Command {
  constructor(duel) {
    this.duel = duel;
  }

  async exec() {
    return true;
  }

  isConditionCheck() {
    return true;
  }
}

class DrawCommand extends Command {
  constructor(duel) {
    super(duel);
    this.currentDuelist = this.duel.getCurrentDuelist();
    this.currentTurn = this.duel.getCurrentTurn();
    this.currentPhase = this.currentTurn.getCurrentPhase();
  }

  async exec() {
    await this.duel.runAction(new DrawAction(this.duel));
  }

  isConditionCheck() {
    if (this.currentPhase.getId() != PHASE.DRAW) {
      return false;
    }

    if (!this.currentDuelist.isCapableDraw()) {
      return false;
    }

    return true;
  }
}

class SummonCommand extends Command {
  constructor(duel) {
    super(duel);
    this.currentDuelist = this.duel.getCurrentDuelist();
    this.currentTurn = this.duel.getCurrentTurn();
    this.currentPhase = this.currentTurn.getCurrentPhase();
  }

  async exec() {
    let loc0 = await this.duel.operationSelectLocation([[LOCATION.HAND], 0], card => {
      return card && card.isSummonable()
    });

    if (loc0 == null) {
      return false;
    }

    let loc1 = await this.duel.operationSelectLocation([[LOCATION.MZONE], 0], card => {
      return card == null
    });

    if (loc1 == null) {
      return false;
    }

    await this.duel.runAction(new SummonAction(this.duel, loc0.card, loc1.index));
  }

  isConditionCheck() {
    if (this.currentPhase.getId() != PHASE.MAIN) {
      return false;
    }

    if (!this.currentDuelist.isCapableSummon()) {
      return false;
    }

    let arr0 = this.duel.utilsQuery(this.duel.getCurrentDuelistIndex(), [[LOCATION.HAND], 0], card => {
      return card && card.isSummonable()
    });

    if (arr0.length == 0) {
      return false;
    }

    let arr1 = this.duel.utilsQuery(this.duel.getCurrentDuelistIndex(), [[LOCATION.MZONE], 0], card => {
      return card == null;
    });

    if (arr1.length == 0) {
      return false;
    }

    return true;
  }
}

class SetCommand extends Command {
  constructor(duel) {
    super(duel);
    this.currentDuelist = this.duel.getCurrentDuelist();
    this.currentTurn = this.duel.getCurrentTurn();
    this.currentPhase = this.currentTurn.getCurrentPhase();
  }

  async exec() {
    let loc0 = await this.duel.operationSelectLocation([[LOCATION.HAND], 0], card => {
      return card && card.isSetable()
    });

    if (loc0 == null) {
      return false;
    }

    let loc1 = await this.duel.operationSelectLocation([[LOCATION.SZONE], 0], card => {
      return card == null
    });

    if (loc1 == null) {
      return false;
    }

    await this.duel.runAction(new SetAction(this.duel, loc0.card, loc1.index));
  }

  isConditionCheck() {
    if (this.currentPhase.getId() != PHASE.MAIN) {
      return false;
    }

    if (!this.currentDuelist.isCapableSet()) {
      return false;
    }

    let arr0 = this.duel.utilsQuery(this.duel.getCurrentDuelistIndex(), [[LOCATION.HAND], 0], card => {
      return card && card.isSetable()
    });

    if (arr0.length == 0) {
      return false;
    }

    let arr1 = this.duel.utilsQuery(this.duel.getCurrentDuelistIndex(), [[LOCATION.SZONE], 0], card => {
      return card == null
    });

    if (arr1.length == 0) {
      return false;
    }

    return true;
  }
}

class ChangePositionCommand extends Command {
  constructor(duel) {
    super(duel);
    this.currentDuelist = this.duel.getCurrentDuelist();
    this.currentTurn = this.duel.getCurrentTurn();
    this.currentPhase = this.currentTurn.getCurrentPhase();
  }

  async exec() {
    let loc0 = await this.duel.operationSelectLocation([[LOCATION.MZONE], [LOCATION.MZONE]], card => {
      return card && card.getControler() == this.duel.getCurrentDuelistIndex() && card.isCapableChangePosition()
    });

    if (loc0 == null) {
      return false;
    }

    await this.duel.runAction(new ChangePositionAction(this.duel, loc0.card));
  }

  isConditionCheck() {
    if (this.currentPhase.getId() != PHASE.MAIN) {
      return false;
    }

    if (!this.currentDuelist.isCapableChangePosition()) {
      return false;
    }

    let arr0 = this.duel.utilsQuery(this.duel.getCurrentDuelistIndex(), [[LOCATION.MZONE], [LOCATION.MZONE]], card => {
      return card && card.getControler() == this.duel.getCurrentDuelistIndex() && card.isCapableChangePosition()
    });

    if (arr0.length == 0) {
      return false;
    }

    return true;
  }
}

class BattleCommand extends Command {
  constructor(duel) {
    super(duel);
    this.currentDuelist = this.duel.getCurrentDuelist();
    this.currentTurn = this.duel.getCurrentTurn();
    this.currentPhase = this.currentTurn.getCurrentPhase();
  }

  async exec() {
    let loc0 = await this.duel.operationSelectLocation([[LOCATION.MZONE], [LOCATION.MZONE]], card => {
      return card && card.getControler() == this.duel.getCurrentDuelistIndex() && card.isCapableAttack()
    });

    if (loc0 == null) {
      return false;
    }

    let arr1 = this.duel.utilsQuery(this.duel.getCurrentDuelistIndex(), [[LOCATION.MZONE], [LOCATION.MZONE]], card => {
      return card && card.getControler() == this.duel.getOpponentDuelistIndex()
    });

    if (arr1.length == 0) {
      await this.duel.runAction(new DirectAttackAction(this.duel, loc0.card));
      return true;
    }

    let loc1 = await this.duel.operationSelectLocation([[LOCATION.MZONE], [LOCATION.MZONE]], card => {
      return card && card.getControler() == this.duel.getOpponentDuelistIndex()
    });

    if (loc1 == null) {
      return false;
    }

    await this.duel.runAction(new BattleAction(this.duel, loc0.card, loc1.card));
  }

  isConditionCheck() {
    if (this.currentPhase.getId() != PHASE.BATTLE) {
      return false;
    }

    if (!this.currentDuelist.isCapableBattle()) {
      return false;
    }

    let arr0 = this.duel.utilsQuery(this.duel.getCurrentDuelistIndex(), [[LOCATION.MZONE], [LOCATION.MZONE]], card => {
      return card && card.getControler() == this.duel.getCurrentDuelistIndex() && card.isCapableAttack()
    });

    if (arr0.length == 0) {
      return false;
    }

    return true;
  }
}

class NextPhaseCommand extends Command {
  constructor(duel) {
    super(duel);
  }

  async exec() {
    await this.duel.runAction(new NextPhaseAction(this.duel));
  }

  isConditionCheck() {
    return true;
  }
}

class ActivateCommand extends Command {
  constructor(duel) {
    super(duel);
    this.currentDuelist = this.duel.getCurrentDuelist();
    this.currentTurn = this.duel.getCurrentTurn();
    this.currentPhase = this.currentTurn.getCurrentPhase();
  }

  async exec() {
    let loc0 = await this.duel.operationSelectLocation([[LOCATION.SZONE], [LOCATION.SZONE]], card => {
      return card && card.getControler() == this.duel.getCurrentDuelistIndex() && card.isActiveatable(this.duel)
    });

    if (loc0 == null) {
      return false;
    }

    await this.duel.runAction(new ActivateAction(this.duel, loc0.card));
  }

  isConditionCheck() {
    if (this.currentPhase.getId() != PHASE.MAIN) {
      return false;
    }

    if (!this.currentDuelist.isCapableActivate()) {
      return false;
    }

    let arr0 = this.duel.utilsQuery(this.duel.getCurrentDuelistIndex(), [[LOCATION.SZONE], [LOCATION.SZONE]], card => {
      return card && card.getControler() == this.duel.getCurrentDuelistIndex() && card.isActiveatable(this.duel)
    });

    if (arr0.length == 0) {
      return false;
    }

    return true;
  }
}

module.exports.DrawCommand = DrawCommand;
module.exports.SummonCommand = SummonCommand;
module.exports.SetCommand = SetCommand;
module.exports.ChangePositionCommand = ChangePositionCommand;
module.exports.BattleCommand = BattleCommand;
module.exports.NextPhaseCommand = NextPhaseCommand;
module.exports.ActivateCommand = ActivateCommand;