import BaseScene from './BaseScene.js';

export default class DefeatScene extends BaseScene {
    constructor() {
      console.log("✅ DefeatScene.constructor() called");
      super({ key: 'DefeatScene' });
    }
  
    preload() {
      console.log("✅ DefeatScene.preload() called");
      this.load.image('defeat-bg', 'assets/sprites/backgrounds/defeat-bg.png');
    }
  
    create() {
      console.log("✅ DefeatScene.create() called");
      this.initializeScene();  // safely sets up UIManager and transitions
  
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
  
      this.add.image(width / 2, height / 2, 'defeat-bg').setDisplaySize(width, height);
  
      this.ui?.createButton(width / 2, height * 0.75, 'Return to Town', () => {
        this.scene.start('OverworldScene');
      });
    }
  }
  