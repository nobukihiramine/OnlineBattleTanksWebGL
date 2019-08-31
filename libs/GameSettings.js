// ゲームの設定クラス
// ※サーバーとクライアントで共通の設定は、クライアントからも参照できるように、
//   public/js / SharedSettings.jsにて設定する。
module.exports = class GameSettings
{
    // ゲーム全体
    static get FRAMERATE() { return 30; }   // フレームレート（１秒当たりのフレーム数）

    // タンク
    static get TANK_SPEED() { return 150.0; }	// 速度[m/s]。1frameあたり5進む => 1/30[s] で5進む => 1[s]で150進む。
    static get TANK_ROTATION_SPEED() { return 3.0; }// 回転速度[rad/s]。1frameあたり0.1進む => 1/30[s] で0.1進む => 1[s]で3[rad]進む。
    static get TANK_WAIT_FOR_NEW_BULLET() { return 1000.0 * 0.2; }  // 単位[ms]。1000 x X秒
    static get TANK_LIFE_MAX() { return 10; }

    // 壁
    static get WALL_COUNT() { return 3; }

    // 弾丸
    static get BULLET_SPEED() { return 300.0; }
    static get BULLET_LIFETIME_MAX() { return 2.0; }  // 単位[s]。1000[ms] x X秒

    // ボットタンク
    static get BOTTANK_SPEED() { return 120.0; }
    static get BOTTANK_COUNT() { return 3; }
    static get BOTTANK_SHOOT_PROBABILITY_PER_SEC() { return 1.0; }  // 1秒あたりの発射数確率。1.0なら、1秒あたり1発程度発射。
    static get BOTTANK_WAIT_FOR_NEW_BOT() { return 1000.0 * 3.0; }	// 単位[ms]。1000 x X秒
}
